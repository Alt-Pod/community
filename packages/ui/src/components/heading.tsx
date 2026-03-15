import type { HTMLAttributes } from "react";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
}

const levelClasses: Record<string, string> = {
  h1: "text-2xl font-semibold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
};

export function Heading({
  as: Tag = "h1",
  className = "",
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag
      className={`font-heading tracking-tight text-text-primary ${levelClasses[Tag]} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
