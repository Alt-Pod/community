import type { UsageStats } from "@community/shared";

export async function fetchUsageStats(
  range: string = "month"
): Promise<UsageStats> {
  const res = await fetch(`/api/usage?range=${range}`);
  if (!res.ok) throw new Error("Failed to fetch usage stats");
  return res.json();
}
