import type { ReactNode } from "react";

interface NavLink {
  href: string;
  label: string;
  active?: boolean;
}

interface NavbarProps {
  brand: string;
  links: NavLink[];
  right?: ReactNode;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void;
  menuOpenLabel?: string;
  menuCloseLabel?: string;
  linkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

export function Navbar({
  brand,
  links,
  right,
  mobileMenuOpen,
  onMobileMenuToggle,
  menuOpenLabel = "Open menu",
  menuCloseLabel = "Close menu",
  linkComponent: LinkComponent = "a" as unknown as React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
}: NavbarProps) {
  return (
    <>
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border-subtle bg-surface-secondary/80 backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <LinkComponent
            href="/"
            className="font-heading text-lg font-semibold tracking-tight text-text-primary hover:text-accent-gold transition-colors duration-150"
          >
            {brand}
          </LinkComponent>
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <LinkComponent
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded-sm transition-colors duration-150 ${
                  link.active
                    ? "text-accent-gold font-medium bg-accent-gold-pale/50"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                }`}
              >
                {link.label}
              </LinkComponent>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {right && <div className="hidden md:flex">{right}</div>}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors duration-150"
              aria-label={mobileMenuOpen ? menuCloseLabel : menuOpenLabel}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </svg>
              )}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={onMobileMenuToggle}
          />
          <div className="relative mt-[53px] bg-surface-secondary border-b border-border-subtle shadow-elevated">
            <div className="flex flex-col py-2">
              {links.map((link) => (
                <LinkComponent
                  key={link.href}
                  href={link.href}
                  className={`px-6 py-3 text-sm transition-colors duration-150 ${
                    link.active
                      ? "text-accent-gold font-medium bg-accent-gold-pale/50"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                  }`}
                >
                  {link.label}
                </LinkComponent>
              ))}
            </div>
            {right && (
              <div className="px-6 py-3 border-t border-border-subtle">
                {right}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
