'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
  id: string;
  title: string;
  createdAt: string;
}

export function SidebarLink({ id, title, createdAt }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === `/posts/${id}`;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : '';

  return (
    <Link
      href={`/posts/${id}`}
      className={cn(
        'block rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-accent text-accent-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span className="block truncate">{title || '(제목 없음)'}</span>
      {formattedDate && (
        <span className="block text-xs opacity-60">{formattedDate}</span>
      )}
    </Link>
  );
}
