import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchToolDefinitions,
  fetchToolAssignments,
  fetchAgentTools,
  setAgentTools,
} from "./api/toolsApi";

export function useToolDefinitions() {
  return useQuery({
    queryKey: ["tool-definitions"],
    queryFn: fetchToolDefinitions,
  });
}

export function useToolAssignments() {
  return useQuery({
    queryKey: ["tool-assignments"],
    queryFn: fetchToolAssignments,
  });
}

export function useAgentTools(agentId: string | null) {
  return useQuery({
    queryKey: ["agent-tools", agentId],
    queryFn: () => fetchAgentTools(agentId!),
    enabled: !!agentId,
  });
}

export function useSetAgentTools() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, toolIds }: { agentId: string; toolIds: string[] }) =>
      setAgentTools(agentId, toolIds),
    onSuccess: (_data, { agentId }) => {
      queryClient.invalidateQueries({ queryKey: ["agent-tools", agentId] });
    },
  });
}
