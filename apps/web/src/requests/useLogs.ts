import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "./api/logsApi";

export function useLogs(filters?: {
  eventType?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => fetchLogs(filters),
  });
}
