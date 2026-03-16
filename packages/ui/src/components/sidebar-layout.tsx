import type { ReactNode } from "react";

interface SidebarLayoutProps {
  navbar?: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  footer: ReactNode;
  children: ReactNode;
}

export function SidebarLayout({
  navbar,
  sidebar,
  sidebarOpen,
  footer,
  children,
}: SidebarLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-surface-primary">
      {navbar}
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="w-72 flex flex-col border-r border-border-subtle bg-surface-secondary transition-all duration-200">
          {sidebar}
        </aside>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
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
