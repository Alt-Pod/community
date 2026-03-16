import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchScheduledActivities,
  cancelScheduledActivity,
} from "./api/scheduledActivitiesApi";

export function useScheduledActivities(
  from: string,
  to: string,
  agentId?: string
) {
  return useQuery({
    queryKey: ["scheduled-activities", from, to, agentId],
    queryFn: () => fetchScheduledActivities({ from, to, agentId }),
  });
}

export function useCancelScheduledActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelScheduledActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-activities"] });
    },
  });
}
