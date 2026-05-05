'use client';

import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { submitPost } from '@/app/upload/actions';
import { Button } from '@/components/ui/button';

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitPost(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('포스트가 등록되었습니다.');
        router.push('/');
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <Field label="제목" name="studyTitle" required placeholder="스터디 주제를 입력하세요" />
      <Field label="작성자" name="writer" required placeholder="이름을 입력하세요" />

      <div className="space-y-1">
        <label htmlFor="studyNote" className="block text-sm font-medium">
          내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="studyNote"
          name="studyNote"
          required
          rows={6}
          placeholder="학습 내용을 입력하세요"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <Field label="참고 링크 (선택)" name="studyRef" type="url" placeholder="https://..." />
      <Field label="이미지 URL (선택)" name="studyImg" type="url" placeholder="https://..." />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? '등록 중...' : '등록하기'}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = 'text',
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
}
