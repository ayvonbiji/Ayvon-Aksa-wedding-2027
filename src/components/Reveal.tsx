import type { ElementType, ReactNode } from 'react';
import { useReveal } from '../lib/hooks';

interface Props {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
}

/** Gentle fade-and-rise when scrolled into view (instant for reduced motion). */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
