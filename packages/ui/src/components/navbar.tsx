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
  linkComponent: LinkComponent = "a" as unknown as React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
}: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-surface-secondary/80 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <LinkComponent
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-text-primary hover:text-accent-gold transition-colors duration-150"
        >
          {brand}
        </LinkComponent>
        <div className="flex items-center gap-1">
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
      {right && <div>{right}</div>}
    </nav>
  );
}
