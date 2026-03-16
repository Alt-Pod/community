"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, Button } from "@community/ui";
import { uploadFile } from "@/requests/api/filesApi";
import type { FileCategory } from "@community/shared";

interface FileUploadToolProps {
  input: {
    category: FileCategory;
    prompt?: string;
  };
  completed: boolean;
  output?: {
    success: boolean;
    id?: string;
    filename?: string;
    mime_type?: string;
    size_bytes?: number;
    url?: string;
    error?: string;
  };
  onSubmit?: (output: {
    success: boolean;
    id?: string;
    filename?: string;
    mime_type?: string;
    size_bytes?: number;
    url?: string;
    error?: string;
  }) => void;
}

export default function FileUploadTool({
  input,
  completed,
  output,
  onSubmit,
}: FileUploadToolProps) {
  const t = useTranslations("tools.files");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!input?.category) {
    return null;
  }

  if (completed && output) {
    if (output.success) {
      return (
        <Card variant="success" className="max-w-md">
          <p className="text-sm text-text-secondary mb-1">
            {input.prompt || t("uploadFile.defaultPrompt")}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-primary font-medium">
              {output.filename}
            </span>
            <span className="text-xs text-text-tertiary">
              {output.mime_type}
            </span>
          </div>
          {output.url && isImageMime(output.mime_type) && (
            <img
              src={output.url}
              alt={output.filename || "Uploaded file"}
              className="mt-2 max-h-48 rounded border border-border-subtle object-contain"
            />
          )}
        </Card>
      );
    }
    return (
      <Card variant="error" className="max-w-md">
        <p className="text-sm text-error-text">{output.error || t("uploadFile.failed")}</p>
      </Card>
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setError(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function handleUpload() {
    if (!selectedFile || !onSubmit) return;
    setUploading(true);
    setError(null);

    try {
      const result = await uploadFile(selectedFile, input.category);
      onSubmit({
        success: true,
        id: result.id,
        filename: result.filename,
        mime_type: result.mime_type,
        size_bytes: result.size_bytes,
        url: result.url,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setUploading(false);
    }
  }

  const acceptTypes = getAcceptTypes(input.category);

  return (
    <Card className="max-w-md">
      <p className="text-sm font-medium text-text-primary mb-3">
        {input.prompt || t("uploadFile.defaultPrompt")}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileChange}
        className="hidden"
      />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border-subtle rounded-md p-6 text-center hover:border-accent-gold transition-colors cursor-pointer"
        >
          <p className="text-sm text-text-secondary">
            {t("uploadFile.dropzone")}
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {t("uploadFile.hint")}
          </p>
        </button>
      ) : (
        <div className="border border-border-subtle rounded-md p-3">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded mb-2 object-contain"
            />
          )}
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-text-primary truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-text-tertiary">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-xs text-text-tertiary hover:text-text-primary ml-2"
            >
              {t("uploadFile.change")}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-error-text mt-2">{error}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={!selectedFile || uploading}
          onClick={handleUpload}
        >
          {uploading ? t("uploadFile.uploading") : t("uploadFile.upload")}
        </Button>
      </div>
    </Card>
  );
}

function isImageMime(mime?: string): boolean {
  return !!mime && mime.startsWith("image/");
}

function getAcceptTypes(category: FileCategory): string {
  switch (category) {
    case "avatar":
    case "agent_avatar":
    case "chat_image":
      return "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";
    case "document":
      return "application/pdf,.docx,text/plain,text/csv";
    default:
      return "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.docx,text/plain,text/csv";
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
