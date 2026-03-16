import type { ReactNode } from "react";

interface SidebarLayoutProps {
  navbar?: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onCloseSidebar?: () => void;
  sidebarToggle?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function SidebarLayout({
  navbar,
  sidebar,
  sidebarOpen,
  onCloseSidebar,
  sidebarToggle,
  footer,
  children,
}: SidebarLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-surface-primary">
      {navbar}
      <div className="flex flex-1 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar — always visible on md+, toggled on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col border-r border-border-subtle bg-surface-secondary transition-transform duration-200 md:relative md:inset-auto md:z-auto md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile sidebar toggle */}
        {sidebarToggle && (
          <div className="md:hidden">{sidebarToggle}</div>
        )}

        {/* Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        {footer}
      </div>
      </div>
    </div>
  );
}
