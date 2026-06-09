// app/admin/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return <div>접근 권한이 없습니다.</div>;
  }

  const res = await fetch("http://localhost:8080/api/admin/stats", {
    headers: {
      "X-ADMIN-SECRET": process.env.BACKEND_SECRET_KEY!,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return <div>통계 데이터를 불러올 수 없습니다.</div>;
  }

  const stats = await res.json();

  return <AdminDashboard stats={stats} />;
}
