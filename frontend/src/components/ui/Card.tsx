import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className = '', hover = false }: CardProps) {
  const hoverStyles = hover
    ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
}
