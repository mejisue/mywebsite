import { revalidatePostCache } from '@/lib/actions/posts';

export type CreatePostRequest = {
    title: string;
    content: string;
    tags: string[];
};

export type UpdatePostRequest = {
    title: string;
    content: string;
    tags: string[];
};

export type PostSummary = {
    id: number;
    title: string;
    tags: string[];
    thumbnail: string | null;
    createdAt: Date;
};

export type Post = {
    id: number;
    title: string;
    content: string;
    tags: string[];
    createdAt: string;
};

export type PostPage = {
    content: PostSummary[];
    page: number;
    size: number;
    hasNext: boolean;
};

export async function getPostsPage(page: number, size: number): Promise<PostPage> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts?page=${page}&size=${size}`, {
        cache: 'no-store',
    });
    if (!res.ok) {
        throw new Error('게시물 목록을 불러오는데 실패했습니다.');
    }
    return res.json();
}

export async function getPosts(): Promise<PostSummary[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts`, {
        next: { tags: ['posts'], revalidate: 3600 },
    });
    if (!res.ok) {
        throw new Error('게시물 목록을 불러오는데 실패했습니다.');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data.content ?? []);
}

export async function getPost(id: string): Promise<Post> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts/${id}`, {
        next: { tags: ['posts', `post-${id}`], revalidate: 3600 },
    });
    if (!res.ok) {
        throw new Error('게시물을 불러오는데 실패했습니다.');
    }
    return res.json();
}

export async function uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/images`, {
        method: 'POST',
        body: formData,
    });
    if (!res.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
    }
    return res.json();
}

async function revalidatePosts(id?: string): Promise<void> {
    try {
        await revalidatePostCache(id);
    } catch {
        // 캐시 무효화 실패는 치명적이지 않다. 최대 1시간 뒤 자동 갱신된다.
    }
}

export async function createPost(data: CreatePostRequest): Promise<Post> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        throw new Error('출간에 실패했습니다.');
    }
    const post = await res.json();
    await revalidatePosts(String(post.id));
    return post;
}


export async function updatePost(id: string, data: UpdatePostRequest): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!res.ok) {
        throw new Error('게시물 수정에 실패했습니다.');
    }
    await revalidatePosts(id);
}

export async function deletePost(id: string): Promise<void> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        throw new Error('게시물 삭제에 실패했습니다.');
    }
    await revalidatePosts(id);
}