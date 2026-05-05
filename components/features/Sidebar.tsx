import { getPosts } from '@/services/notion';
import { SidebarLink } from './SidebarLink';

export async function Sidebar() {
  const posts = await getPosts();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r overflow-y-auto">
      <div className="px-4 py-3 border-b">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          전체 글
        </p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {posts.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-2">등록된 글 없음</p>
        ) : (
          posts.map((post) => (
            <SidebarLink
              key={post.id}
              id={post.id}
              title={post.studyTitle}
              createdAt={post.createdAt}
            />
          ))
        )}
      </nav>
    </aside>
  );
}
