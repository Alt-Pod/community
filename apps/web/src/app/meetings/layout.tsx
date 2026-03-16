import AppNavbar from "@/components/app-navbar";

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-primary">
      <AppNavbar />
      {children}
    </div>
  );
}
