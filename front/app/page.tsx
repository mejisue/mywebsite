import { getPosts } from "@/lib/api/posts";
import HomePage from "./components/HomePage";
import SecretLogin from "./components/SecretLogin";

export default async function Home() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  try {
    posts = await getPosts();
  } catch {
    // 백엔드 연결 실패 시 빈 배열로 렌더링
  }

  return (
    <>
      <HomePage posts={posts} />
      <SecretLogin />
    </>
  );
}
