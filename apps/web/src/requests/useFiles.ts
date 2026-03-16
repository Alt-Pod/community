import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FileCategory } from "@community/shared";
import {
  fetchFiles,
  fetchFile,
  uploadFile,
  updateFileMetadata,
  deleteFile,
} from "./api/filesApi";

export function useFiles(category?: string) {
  return useQuery({
    queryKey: ["files", category],
    queryFn: () => fetchFiles(category),
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: ["files", id],
    queryFn: () => fetchFile(id),
    enabled: !!id,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      category,
      metadata,
    }: {
      file: File;
      category: FileCategory;
      metadata?: Record<string, unknown>;
    }) => uploadFile(file, category, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useUpdateFileMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      metadata,
    }: {
      id: string;
      metadata: Record<string, unknown>;
    }) => updateFileMetadata(id, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}
