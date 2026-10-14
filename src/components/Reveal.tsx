import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { useReveal } from '../lib/hooks';

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> {
  as?: ElementType;
  /** Entrance style: rise (default), left, right, zoom or fade. */
  variant?: 'up' | 'left' | 'right' | 'zoom' | 'fade';
  className?: string;
  delay?: number;
  children: ReactNode;
}

/** Gentle fade-and-rise when scrolled into view (instant for reduced motion). */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, variant = 'up', children, style, ...rest }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${className}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms`, ['--reveal-delay' as string]: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
