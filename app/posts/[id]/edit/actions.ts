'use server';

import { updatePost } from '@/services/notion';

export async function updateNote(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const studyNote = String(formData.get('studyNote') ?? '').trim();

  if (!studyNote) {
    return { error: '내용을 입력해주세요.' };
  }

  try {
    await updatePost(id, studyNote);
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : '수정에 실패했습니다.' };
  }
}
