export interface StudyPost {
  id: string;
  studyTitle: string;
  writer: string;
  studyNote: string;
  studyRef: string;
  studyImg: string;
  createdAt: string;
}

export function isNotionPage(page: unknown): page is Record<string, unknown> {
  return typeof page === 'object' && page !== null && 'id' in page && 'properties' in page;
}

export function mapPageToStudyPost(page: unknown): StudyPost | null {
  if (!isNotionPage(page)) return null;
  const props = page.properties as Record<string, unknown>;
  return {
    id: String(page.id ?? ''),
    studyTitle: (props?.StudyTitle as any)?.title?.[0]?.plain_text ?? '',
    writer: (props?.Writer as any)?.rich_text?.[0]?.plain_text ?? '',
    studyNote: (props?.StudyNote as any)?.rich_text?.[0]?.plain_text ?? '',
    studyRef: (props?.StudyRef as any)?.url ?? '',
    studyImg: (props?.StudyImg as any)?.url ?? '',
    createdAt: String((page as any).created_time ?? ''),
  };
}