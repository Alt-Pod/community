import AppNavbar from "@/components/app-navbar";

export default function AdminLayout({
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
