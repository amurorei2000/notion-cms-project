import { Client } from '@notionhq/client';
import type { StudyPost } from '@/types/notion';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export async function getPosts(): Promise<StudyPost[]> {
  const response = await notion.dataSources.query({
    data_source_id: DATABASE_ID,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  });

  return response.results.map((page: any) => ({
    id: page.id,
    studyTitle: page.properties?.StudyTitle?.title?.[0]?.plain_text ?? '',
    writer: page.properties?.Writer?.rich_text?.[0]?.plain_text ?? '',
    studyNote: page.properties?.StudyNote?.rich_text?.[0]?.plain_text ?? '',
    studyRef: page.properties?.StudyRef?.url ?? '',
    studyImg: page.properties?.StudyImg?.url ?? '',
    createdAt: page.created_time ?? '',
  }));
}

export async function getPost(id: string): Promise<StudyPost | null> {
  try {
    const page = (await notion.pages.retrieve({ page_id: id })) as any;
    return {
      id: page.id,
      studyTitle: page.properties?.StudyTitle?.title?.[0]?.plain_text ?? '',
      writer: page.properties?.Writer?.rich_text?.[0]?.plain_text ?? '',
      studyNote: page.properties?.StudyNote?.rich_text?.[0]?.plain_text ?? '',
      studyRef: page.properties?.StudyRef?.url ?? '',
      studyImg: page.properties?.StudyImg?.url ?? '',
      createdAt: page.created_time ?? '',
    };
  } catch {
    return null;
  }
}

export async function createPost(
  post: Omit<StudyPost, 'id' | 'createdAt'>,
): Promise<string> {
  const response = await notion.pages.create({
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
