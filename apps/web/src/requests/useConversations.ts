import { useQuery } from "@tanstack/react-query";
import { fetchConversations } from "./api/conversationsApi";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
}
