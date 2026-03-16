import { useQuery } from "@tanstack/react-query";
import { fetchUsageStats } from "./api/usageApi";

export function useUsageStats(range: string = "month") {
  return useQuery({
    queryKey: ["usage", range],
    queryFn: () => fetchUsageStats(range),
  });
}
