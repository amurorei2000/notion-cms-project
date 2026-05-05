import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost } from '@/services/notion';
import { EditNoteForm } from '@/components/features/EditNoteForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post || !post.studyTitle) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/posts/${id}`}
        className="text-sm text-muted-foreground hover:underline mb-6 inline-block"
      >
        ← 상세로
      </Link>

      <h1 className="text-xl font-bold mb-6">{post.studyTitle}</h1>

      <EditNoteForm postId={id} initialNote={post.studyNote} />
    </div>
  );
}