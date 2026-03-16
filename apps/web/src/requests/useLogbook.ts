import { useQuery } from "@tanstack/react-query";
import {
  fetchTodayLogbook,
  fetchLogbookByDate,
  fetchLogbookEntries,
} from "./api/logbookApi";

export function useTodayLogbook() {
  return useQuery({
    queryKey: ["logbook", "today"],
    queryFn: fetchTodayLogbook,
  });
}

export function useLogbookEntry(date: string) {
  return useQuery({
    queryKey: ["logbook", date],
    queryFn: () => fetchLogbookByDate(date),
    enabled: !!date,
  });
}

export function useLogbookEntries(params?: {
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["logbook", "list", params],
    queryFn: () => fetchLogbookEntries(params),
  });
}
