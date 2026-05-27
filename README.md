# myWebsite

개인 포트폴리오 및 블로그 사이트

## 기술 스택

**Frontend**

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| UI | TailwindCSS v4, shadcn/ui |
| 애니메이션 | GSAP |
| 서버 상태 | TanStack Query v5 |
| 인증 | NextAuth v4 |
| 마크다운 | react-markdown, remark-gfm |

**Backend**

| 분류 | 기술 |
|------|------|
| 프레임워크 | Spring Boot 3.5, Java 17 |
| 데이터베이스 | MySQL 8 (JPA) |
| 인증 | Spring Security, OAuth2 Resource Server |
| 파일 스토리지 | AWS S3 |

## 주요 기능

- 블로그 게시글 작성·조회 (마크다운 지원)
- 관리자 글쓰기 페이지 (`/admin/write`)
- 이미지 업로드 (AWS S3)
- OAuth2 인증

## 구조

```
myWebsite/
├── front/      # Next.js + TypeScript
└── backend/    # Spring Boot + MySQL
```

## 로컬 실행

### 사전 요구사항

- Node.js 20+, pnpm
- JDK 17+
- Docker

### Backend

```bash
cd backend

# MySQL 컨테이너 실행
docker compose up -d

# 서버 실행 (포트 8080)
./gradlew bootRun
```

### Frontend

```bash
cd front
pnpm install
pnpm dev    # http://localhost:3000
```
