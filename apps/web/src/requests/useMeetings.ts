import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMeetings,
  fetchMeeting,
  scheduleMeeting,
} from "./api/meetingsApi";
import type { ScheduleMeetingInput } from "./api/meetingsApi";

export function useMeetings(from?: string, to?: string) {
  return useQuery({
    queryKey: ["meetings", from, to],
    queryFn: () => fetchMeetings({ from, to }),
    refetchInterval: 15_000, // poll every 15s for live status
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => fetchMeeting(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 5s while meeting is scheduled or running, stop when completed
      const status = query.state.data?.activity?.status;
      if (status === "scheduled" || status === "running") return 5_000;
      return false;
    },
  });
}

export function useScheduleMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleMeetingInput) => scheduleMeeting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-activities"] });
    },
  });
}
