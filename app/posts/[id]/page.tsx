import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost } from '@/services/notion';
import { Button } from '@/components/ui/button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || !post.studyTitle) notFound();

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← 목록으로
        </Link>
        <Button asChild variant="outline" size="sm">
          <Link href={`/posts/${id}/edit`}>글 수정</Link>
        </Button>
      </div>

      <article className="space-y-4">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {post.studyImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.studyImg}
              alt={post.studyTitle}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              이미지 없음
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold">{post.studyTitle}</h1>

        <div className="flex items-center gap-3 text-sm text-muted-foreground border-b pb-4">
          <span>{post.writer}</span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>

        {post.studyNote && (
          <p className="whitespace-pre-wrap leading-relaxed">{post.studyNote}</p>
        )}

        {post.studyRef && (
          <a
            href={post.studyRef}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm underline text-blue-600 dark:text-blue-400"
          >
            참고 링크 →
          </a>
        )}
      </article>
    </div>
  );
}
