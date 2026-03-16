"use client";

import { useState } from "react";

interface FileImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function FileImage({ src, alt = "", className }: FileImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-md text-muted-foreground text-sm ${className ?? ""}`}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`rounded-md max-w-full h-auto ${loading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
}
