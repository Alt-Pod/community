import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecurringActivityStatus } from "@community/shared";
import {
  fetchRecurringActivities,
  createRecurringActivity,
  updateRecurringActivity,
  deleteRecurringActivity,
  pauseRecurringActivity,
} from "./api/recurringActivitiesApi";

export function useRecurringActivities(status?: RecurringActivityStatus) {
  return useQuery({
    queryKey: ["recurring-activities", status],
    queryFn: () => fetchRecurringActivities(status),
  });
}

export function useCreateRecurringActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRecurringActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-activities"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-activities"] });
    },
  });
}

export function useUpdateRecurringActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      updateRecurringActivity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-activities"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-activities"] });
    },
  });
}

export function useDeleteRecurringActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cancelFuture }: { id: string; cancelFuture?: boolean }) =>
      deleteRecurringActivity(id, cancelFuture),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-activities"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-activities"] });
    },
  });
}

export function usePauseRecurringActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "paused" | "active" }) =>
      pauseRecurringActivity(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-activities"] });
    },
  });
}
