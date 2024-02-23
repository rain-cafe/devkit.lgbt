import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export type PageContentProps = {
  children: ReactNode;
  className?: string;
};

export function PageContent({ children, className }: PageContentProps) {
  return <div className={cn('flex flex-col gap-2 p-4', className)}>{children}</div>;
}
