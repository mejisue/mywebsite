"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
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

const PASTEL_COLORS = [
  "#BBF7D0", "#86EFAC", "#A7F3D0", "#D1FAE5",
  "#6EE7B7", "#99F6E4", "#C6F6D5", "#B2F5EA",
];

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
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

  const tagData = stats.tags.slice(0, 8).map((t) => ({
    name: t.tag,
    value: t.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm text-gray-600">관리자 페이지</p>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="총 게시물" value={stats.totalPosts} accent="#C4B5FD" />
          <StatCard label="이번 달 게시물" value={stats.thisMonthPosts} accent="#86EFAC" />
          <StatCard label="총 조회수" value={stats.totalViewCount} accent="#7DD3FC" />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-600">
            월별 게시물 수
          </h2>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-gray-600">데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barSize={40}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#374151" }}
                  labelStyle={{ color: "#374151" }}
                />
                <Bar dataKey="count" name="게시물 수" fill="#C4B5FD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-600">
              태그 분포 Top 8
            </h2>
            {tagData.length === 0 ? (
              <p className="text-sm text-gray-600">데이터가 없습니다.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tagData.map((_, i) => (
                      <Cell key={i} fill={PASTEL_COLORS[i % PASTEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", color: "#374151" }}
                  formatter={(value) => <span style={{ color: "#374151" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-600">
              최근 게시물
            </h2>
            {stats.recentPosts.length === 0 ? (
              <p className="text-sm text-gray-600">게시물이 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {stats.recentPosts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <Link
                      href={`/post/${post.id}`}
                      className="truncate text-sm font-medium text-gray-700 hover:text-violet-500 transition-colors"
                    >
                      {post.title}
                    </Link>
                    <span className="ml-4 shrink-0 text-xs text-gray-600">
                      {formatDate(post.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
