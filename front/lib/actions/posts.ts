'use server';

import { updateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function revalidatePostCache(id?: string): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        throw new Error('권한이 없습니다.');
    }

    updateTag('posts');
    if (id) {
        updateTag(`post-${id}`);
    }
}
