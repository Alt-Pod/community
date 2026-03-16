"use client";

import { use } from "react";
import MeetingViewer from "@/components/meeting-viewer";

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <MeetingViewer meetingId={id} />
    </div>
  );
}
