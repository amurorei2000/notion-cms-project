import { getPosts } from '@/services/notion';
import { PostCard } from '@/components/features/PostCard';

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">스터디 포스트</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-16">
          등록된 포스트가 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
