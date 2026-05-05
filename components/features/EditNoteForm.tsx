'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateNote } from '@/app/posts/[id]/edit/actions';
import { Button } from '@/components/ui/button';

interface Props {
  postId: string;
  initialNote: string;
}

export function EditNoteForm({ postId, initialNote }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateNote(postId, formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('내용이 수정되었습니다.');
        router.push(`/posts/${postId}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="studyNote" className="block text-sm font-medium">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="studyNote"
          name="studyNote"
          required
          rows={10}
          defaultValue={initialNote}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/posts/${postId}`)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </form>
  );
}