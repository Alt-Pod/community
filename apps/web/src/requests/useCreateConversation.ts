import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "./api/conversationsApi";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => createConversation(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
