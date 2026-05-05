import Link from 'next/link';
import type { StudyPost } from '@/types/notion';

interface PostCardProps {
  post: StudyPost;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <article className="rounded-lg border bg-card p-5 transition-shadow hover:shadow-md h-full flex flex-col gap-3">
        {post.studyImg && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.studyImg}
              alt={post.studyTitle}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col gap-1 flex-1">
          <h2 className="text-base font-semibold line-clamp-2 group-hover:underline">
            {post.studyTitle || '(제목 없음)'}
          </h2>
          {post.studyNote && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.studyNote}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t">
          <span>{post.writer || '작성자 미상'}</span>
          <span>{formattedDate}</span>
        </div>
      </article>
    </Link>
  );
}
