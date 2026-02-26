// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);

    // 1차 방어: Next.js에서 이메일 체크
    if (session?.user?.email !== process.env.ADMIN_EMAIL) {
        return <div>접근 권한이 없습니다.</div>;
    }

    // 2. Spring Boot로 요청 (비밀 열쇠 포함)
    const res = await fetch("http://localhost:8080/api/admin/data", {
        headers: {
            "X-ADMIN-SECRET": process.env.BACKEND_SECRET_KEY!, // 비밀번호 전달
        },
    });

    const message = await res.text();
    return <div>{message}</div>;
}