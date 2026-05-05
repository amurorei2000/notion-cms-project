'use server';

import { createPost } from '@/services/notion';

export async function submitPost(formData: FormData): Promise<{ error?: string }> {
  const studyTitle = (formData.get('studyTitle') as string | null)?.trim() ?? '';
  const writer = (formData.get('writer') as string | null)?.trim() ?? '';
  const studyNote = (formData.get('studyNote') as string | null)?.trim() ?? '';
  const studyRef = (formData.get('studyRef') as string | null)?.trim() ?? '';
  const studyImg = (formData.get('studyImg') as string | null)?.trim() ?? '';

  if (!studyTitle || !writer || !studyNote) {
    return { error: '필수 항목을 모두 입력해 주세요.' };
  }

  try {
    await createPost({ studyTitle, writer, studyNote, studyRef, studyImg });
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : '등록에 실패했습니다.' };
  }
}