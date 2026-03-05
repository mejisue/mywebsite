export type CreatePostRequest = {
    title: string;
    content: string;
    tags: string[];
};

export type Post = {
    id: string;
    title: string;
    content: string;
    tags: string[];
    // TODO: createdAt - entity에 추가 후 활성화
};

export async function getPost(id: string): Promise<Post> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/posts/${id}`, {
        cache: 'no-store',
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

export async function createPost(data: CreatePostRequest): Promise<void> {
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
}
