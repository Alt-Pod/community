import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMessages } from "./api/messagesApi";

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    enabled: !!conversationId,
  });
}

export function usePrefetchMessages() {
  const queryClient = useQueryClient();

  return (conversationId: string) =>
    queryClient.fetchQuery({
      queryKey: ["messages", conversationId],
      queryFn: () => fetchMessages(conversationId),
    });
}
