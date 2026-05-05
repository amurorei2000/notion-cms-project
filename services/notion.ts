import { mapPageToStudyPost } from '@/types/notion';
import type { StudyPost } from '@/types/notion';

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_API_KEY = process.env.NOTION_API_KEY!;
// @notionhq/client v5 uses Notion-Version 2025-09-03 which removed /databases/{id}/query.
// Using fetch directly with 2022-06-28 to retain the stable database query endpoint.
const NOTION_VERSION = '2022-06-28';
const NOTION_BASE = 'https://api.notion.com/v1';

async function notionPost<T>(path: string, body?: unknown, revalidate?: number): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
    ...(revalidate !== undefined && { next: { revalidate } }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion API error: ${err.message ?? res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function notionPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion API error: ${err.message ?? res.statusText}`);
  }
  return res.json() as Promise<T>;
}

async function notionGet<T>(path: string, revalidate?: number): Promise<T> {
  const res = await fetch(`${NOTION_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
    },
    ...(revalidate !== undefined && { next: { revalidate } }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Notion API error: ${err.message ?? res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getPosts(): Promise<StudyPost[]> {
  const response = await notionPost<{ results: unknown[] }>(
    `/databases/${DATABASE_ID}/query`,
    { sorts: [{ timestamp: 'created_time', direction: 'descending' }] },
    60,
  );

  return response.results.flatMap((page) => {
    const post = mapPageToStudyPost(page);
    return post ? [post] : [];
  });
}

export async function getPost(id: string): Promise<StudyPost | null> {
  try {
    const page = await notionGet<unknown>(`/pages/${id}`, 300);
    return mapPageToStudyPost(page);
  } catch {
    return null;
  }
}

export async function updatePost(id: string, studyNote: string): Promise<void> {
  await notionPatch(`/pages/${id}`, {
    properties: {
      StudyNote: { rich_text: [{ text: { content: studyNote } }] },
    },
  });
}

export async function createPost(
  post: Omit<StudyPost, 'id' | 'createdAt'>,
): Promise<string> {
  const response = await notionPost<{ id: string }>('/pages', {
    parent: { database_id: DATABASE_ID },
    properties: {
      StudyTitle: { title: [{ text: { content: post.studyTitle } }] },
      Writer: { rich_text: [{ text: { content: post.writer } }] },
      StudyNote: { rich_text: [{ text: { content: post.studyNote } }] },
      StudyRef: { url: post.studyRef || null },
      StudyImg: { url: post.studyImg || null },
    },
  });
  return response.id;
}
