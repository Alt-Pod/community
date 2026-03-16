import {
  inngest,
  agentRepository,
  messageRepository,
  toolService,
  jobService,
  scheduledActivityRepository,
  agentService,
  withJobTracking,
} from "@community/backend";
import { buildToolsForAgent, DEFAULT_ASSISTANT_TOOL_IDS } from "../tools";
import { buildDefaultSystemPrompt } from "../context";
import type { Agent } from "@community/shared";
import {
  loadMeetingHistory,
  generateAgentTurnWithTools,
  generateDefaultAssistantTurn,
  generateMasterTransition,
  wrapToolsWithSupervisor,
} from "./meetingHelper";

const MAX_ROUNDS = 5;

export const meetingRound = inngest.createFunction(
  { id: "meeting-round", retries: 1 },
  [
    { event: "meeting/started" },
    { event: "meeting/round-completed" },
  ],
  async ({ event, step }) => {
    const {
      activityId,
      jobId,
      conversationId,
      userId,
      agenda,
      participantAgentIds,
      durationMinutes,
      endTime,
    } = event.data;

    // Determine round number
    const roundNumber = event.name === "meeting/started"
      ? 1
      : (event.data as { roundNumber?: number }).roundNumber ?? 1;

    const result = await step.run(`round-${roundNumber}`, async () => {
      return withJobTracking(
        { jobService, activityRepository: scheduledActivityRepository },
        jobId,
        activityId,
        async () => {
          // Load agents
          const agents: Agent[] = [];
          for (const agentId of participantAgentIds) {
            const agent = await agentRepository.findById(agentId);
            if (agent) agents.push(agent);
          }

          const participantNames = [...agents.map((a) => a.name), "Assistant"];
          let timeUp = false;

          for (const agent of agents) {
            // Check time before each turn
            if (Date.now() >= endTime) {
              timeUp = true;
              break;
            }

            // Load fresh history for each turn
            const history = await loadMeetingHistory(conversationId, agents);

            // Build agent's tools with supervisor wrapping
            const toolIds = await toolService.getToolsForAgent(agent.id);
            const rawTools = buildToolsForAgent(toolIds, { userId, agentId: agent.id }, { serverOnly: true });
            const tools = wrapToolsWithSupervisor(
              rawTools,
              agenda,
              () => history
            );

            // Generate agent's turn
            const { text, toolActions } = await generateAgentTurnWithTools(
              agent,
              history,
              agenda,
              participantNames,
              tools
            );

            // Save the message
            const parts = toolActions.length > 0
              ? toolActions.map((ta) => ({
                  type: "tool-action",
                  toolName: ta.toolName,
                  approved: ta.approved,
                  reason: ta.reason,
                }))
              : undefined;

            console.log(`[meeting] Saving agent "${agent.name}" message — content length: ${text.length}, tool actions: ${toolActions.length}`);
            await messageRepository.create({
              conversationId,
              role: "assistant",
              content: text,
              agentId: agent.id,
              parts: parts as unknown[] | undefined,
            });
          }

          // Default assistant turn (always participates)
          if (!timeUp && Date.now() < endTime) {
            const assistantHistory = await loadMeetingHistory(conversationId, agents);
            const allAgents = await agentService.getAll();
            const assistantSystemPrompt = buildDefaultSystemPrompt(allAgents);
            const assistantRawTools = buildToolsForAgent(DEFAULT_ASSISTANT_TOOL_IDS, { userId }, { serverOnly: true });
            const assistantTools = wrapToolsWithSupervisor(
              assistantRawTools,
              agenda,
              () => assistantHistory
            );

            const { text: assistantText, toolActions: assistantToolActions } =
              await generateDefaultAssistantTurn(
                assistantSystemPrompt,
                assistantHistory,
                agenda,
                participantNames,
                assistantTools
              );

            const assistantParts: unknown[] = [
              { type: "speaker-tag", speakerType: "default-assistant" },
              ...assistantToolActions.map((ta) => ({
                type: "tool-action",
                toolName: ta.toolName,
                approved: ta.approved,
                reason: ta.reason,
              })),
            ];

            console.log(`[meeting] Saving default assistant message — content length: ${assistantText.length}, tool actions: ${assistantToolActions.length}`);
            await messageRepository.create({
              conversationId,
              role: "assistant",
              content: assistantText,
              agentId: null,
              parts: assistantParts,
            });
          }

          return { timeUp, agentsSpoken: agents.length + 1 };
        }
      );
    });

    // Decide next step
    const isTimeUp = result.timeUp || Date.now() >= endTime;
    const maxRoundsReached = roundNumber >= MAX_ROUNDS;

    if (isTimeUp || maxRoundsReached) {
      // Emit closing event
      await step.sendEvent("trigger-closing", {
        name: "meeting/closing",
        data: {
          activityId,
          jobId,
          conversationId,
          userId,
          agenda,
          participantAgentIds,
          durationMinutes,
        },
      });

      return { roundNumber, timeUp: true, nextStep: "closing" };
    }

    // Generate master transition
    await step.run(`master-transition-${roundNumber}`, async () => {
      const agents: Agent[] = [];
      for (const agentId of participantAgentIds) {
        const agent = await agentRepository.findById(agentId);
        if (agent) agents.push(agent);
      }
      const history = await loadMeetingHistory(conversationId, agents);
      const transition = await generateMasterTransition(history, roundNumber, agenda);
      await messageRepository.create({
        conversationId,
        role: "assistant",
        content: transition,
        agentId: null,
      });
    });

    // Emit event for next round
    await step.sendEvent("trigger-next-round", {
      name: "meeting/round-completed",
      data: {
        activityId,
        jobId,
        conversationId,
        userId,
        roundNumber: roundNumber + 1,
        agenda,
        participantAgentIds,
        durationMinutes,
        endTime,
      },
    });

    return { roundNumber, timeUp: false, nextStep: "next-round" };
  }
);
