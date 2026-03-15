interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="mx-8 mt-4 rounded-md bg-error-bg border border-error-border px-4 py-3 text-sm text-error">
      {message}
    </div>
  );
}
