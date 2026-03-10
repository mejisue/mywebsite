import { getPostsPage } from '@/lib/api/posts';
import PostListClient from './PostListClient';

export default async function PostListPage() {
    const initialData = await getPostsPage(0);

    return (
        <div className="flex min-h-screen justify-center bg-white">
            <div className="w-full max-w-3xl px-16 py-20">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">글 목록</h1>

                <div className="mt-12">
                    <PostListClient initialData={initialData} />
                </div>
            </div>
        </div>
    );
}
