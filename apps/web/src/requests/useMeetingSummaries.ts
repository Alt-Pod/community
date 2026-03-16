import { useQuery } from "@tanstack/react-query";
import { fetchMeetingSummaries } from "./api/meetingSummariesApi";

export function useMeetingSummaries() {
  return useQuery({
    queryKey: ["meeting-summaries"],
    queryFn: fetchMeetingSummaries,
  });
}
