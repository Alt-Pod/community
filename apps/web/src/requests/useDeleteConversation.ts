import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteConversation } from "./api/conversationsApi";

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.removeQueries({ queryKey: ["messages", id] });
    },
  });
}
