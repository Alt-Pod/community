import type { ReactNode } from "react";

interface SidebarLayoutProps {
  navbar?: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  header: ReactNode;
  headerRight?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function SidebarLayout({
  navbar,
  sidebar,
  sidebarOpen,
  onToggleSidebar,
  header,
  headerRight,
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
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="text-text-tertiary hover:text-text-primary text-sm transition-colors duration-150"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            {header}
          </div>
          {headerRight}
        </header>

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
