"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface MonthlyPostCount {
  year: number;
  month: number;
  count: number;
}

interface TagCount {
  tag: string;
  count: number;
}

interface RecentPost {
  id: number;
  title: string;
  createdAt: string;
}

interface AdminStats {
  totalPosts: number;
  thisMonthPosts: number;
  totalViewCount: number;
  monthly: MonthlyPostCount[];
  tags: TagCount[];
  recentPosts: RecentPost[];
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function formatMonth({ year, month }: MonthlyPostCount) {
  return `${year}.${String(month).padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboard({ stats }: { stats: AdminStats }) {
  const monthlyData = stats.monthly.map((m) => ({
    name: formatMonth(m),
    count: m.count,
  }));

  const tagData = stats.tags.map((t) => ({
    name: t.tag,
    count: t.count,
  }));

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold">어드민 대시보드</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="총 게시물" value={stats.totalPosts} />
        <StatCard label="이번 달 게시물" value={stats.thisMonthPosts} />
        <StatCard label="총 조회수" value={stats.totalViewCount} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold">월별 게시물 수</h2>
        {monthlyData.length === 0 ? (
          <p className="text-sm text-muted">데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="게시물 수" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold">태그 분포 Top 10</h2>
        {tagData.length === 0 ? (
          <p className="text-sm text-muted">데이터가 없습니다.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tagData} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="count" name="게시물 수" radius={[0, 4, 4, 0]}>
                {tagData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 15}, 70%, 55%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-lg font-semibold">최근 게시물</h2>
        {stats.recentPosts.length === 0 ? (
          <p className="text-sm text-muted">게시물이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 font-medium">제목</th>
                <th className="pb-2 font-medium">작성일</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPosts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-0">
                  <td className="py-2">{post.title}</td>
                  <td className="py-2 text-muted">{formatDate(post.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
