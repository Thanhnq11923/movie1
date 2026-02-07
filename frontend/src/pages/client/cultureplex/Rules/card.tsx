import type { ReactNode } from "react";

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className = "", children }: CardProps) {
  return <div className={`${className}`}>{children}</div>;
}

interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export function CardContent({ className = "", children }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
