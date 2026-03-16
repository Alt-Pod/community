"use client";

import { useTranslations } from "next-intl";

export interface AttachedFile {
  localFile: File;
  preview?: string;
  uploading: boolean;
  uploaded?: { id: string; url: string; filename: string; mime_type: string };
  error?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatAttachmentPreview({
  files,
  onRemove,
}: {
  files: AttachedFile[];
  onRemove: (index: number) => void;
}) {
  const t = useTranslations("chat.attachments");

  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap px-1 pb-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-secondary text-sm max-w-[220px]"
        >
          {file.preview ? (
            <img
              src={file.preview}
              alt=""
              className="w-6 h-6 rounded object-cover flex-shrink-0"
            />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 text-text-secondary"
            >
              <path d="M9 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9 1.5z" />
              <path d="M9 1.5V5.5h4" />
            </svg>
          )}
          <div className="truncate flex-1 min-w-0">
            <span className="truncate block text-text-primary text-xs">
              {file.localFile.name}
            </span>
            <span className="text-text-tertiary text-[10px]">
              {file.uploading
                ? t("uploading")
                : file.error
                  ? file.error
                  : formatSize(file.localFile.size)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="flex-shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
            aria-label={t("remove")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l6 6M10 4l-6 6" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
