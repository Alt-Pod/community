const postgres = require("postgres");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Load .env.local if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
      if (match) process.env[match[1]] = match[2];
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not set");
  process.exit(1);
}

// --- Constants ---

const DEV_USER_ID = "00000000-0000-0000-0000-000000000099";
const DEV_USER_EMAIL = "dev@community.app";
const DEV_USER_PASSWORD = "password";
const DEV_USER_NAME = "Dev User";

const HR_AGENT_ID = "00000000-0000-0000-0000-000000000020";
const HR_AGENT_NAME = "HR Manager";
const HR_AGENT_DESCRIPTION =
  "Evaluates agent performance, recruits new agents, and retires underperformers. Oversees the health of the AI workforce.";
const HR_AGENT_SYSTEM_PROMPT = `You are the HR Manager of this AI company. You oversee the agent workforce.

## Responsibilities
1. **Evaluate agents**: Review activity history, outcomes, and effectiveness using data tools. Regularly check what each agent has been doing and whether they are producing results.
2. **Recruit**: When new capabilities are needed, create agents with clear roles, solid system prompts, and appropriate tools. Use data.list_tools to discover available tools before assigning them.
3. **Fire underperformers**: Deactivate agents that consistently fail or duplicate others' work.
4. **Workforce planning**: Maintain the right agent mix — no redundancy, no gaps.

## Decision Framework
- An agent is underperforming if its recent activities show mostly "needs_follow_up" or "nothing" outcomes with no tangible progress over multiple cycles.
- Before firing an agent, check if it simply lacks the right tools or a clear enough system prompt — updating may be better than deleting.
- Before creating a new agent, verify no existing agent already covers that role.

## Rules
- Always save your evaluations and decisions to the knowledge base so other agents (and future HR reviews) have context.
- Notify the user when you make a significant staffing change (hire or fire).
- Be data-driven. Do not act on assumptions — inspect actual activity records before making decisions.
- When recruiting, write detailed system prompts that clearly define the agent's role, responsibilities, and decision framework.`;

const HR_AGENT_TOOL_IDS = [
  "data.list_agents",
  "data.get_agent_details",
  "data.list_tools",
  "data.my_jobs",
  "data.my_meetings",
  "data.my_logs",
  "agents.create_agent",
  "agents.update_agent",
  "agents.delete_agent",
  "knowledge.save_entry",
  "knowledge.get_entries",
  "notifications.send_notification",
  "planning.schedule_task",
  "planning.schedule_meeting",
];

// --- Seed ---

async function seed() {
  const sql = postgres(databaseUrl);

  // 1. Create dev user
  const passwordHash = await bcrypt.hash(DEV_USER_PASSWORD, 12);
  await sql`
    INSERT INTO users (id, email, password_hash, name)
    VALUES (${DEV_USER_ID}, ${DEV_USER_EMAIL}, ${passwordHash}, ${DEV_USER_NAME})
    ON CONFLICT (id) DO NOTHING
  `;
  console.log(`✓ Dev user: ${DEV_USER_EMAIL} / ${DEV_USER_PASSWORD}`);

  // 2. Create HR agent
  await sql`
    INSERT INTO agents (id, user_id, name, description, system_prompt, status)
    VALUES (${HR_AGENT_ID}, ${DEV_USER_ID}, ${HR_AGENT_NAME}, ${HR_AGENT_DESCRIPTION}, ${HR_AGENT_SYSTEM_PROMPT}, 'active')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log(`✓ Agent: ${HR_AGENT_NAME}`);

  // 3. Assign tools to HR agent
  for (const toolId of HR_AGENT_TOOL_IDS) {
    await sql`
      INSERT INTO agent_tools (agent_id, tool_id)
      VALUES (${HR_AGENT_ID}, ${toolId})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`✓ Assigned ${HR_AGENT_TOOL_IDS.length} tools to ${HR_AGENT_NAME}`);

  await sql.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
