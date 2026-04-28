# Development Guidelines

## Project Overview

- **목적**: Notion을 CMS로 사용하는 LLM 서빙 팀 스터디 블로그
- **스택**: Next.js 16 (App Router) · TypeScript 5 · Tailwind v4 · shadcn/ui (radix-lyra) · @notionhq/client v5 · pnpm
- **3개 라우트**: `/`(목록) · `/posts/[id]`(상세) · `/upload`(등록)

---

## Directory Rules

```
app/                    # Next.js 페이지 (App Router)
  layout.tsx            # 전역 레이아웃 — 프로바이더 체인 관리
  page.tsx              # / 목록 페이지 (Server Component)
  posts/[id]/page.tsx   # 상세 페이지 (Server Component)
  upload/page.tsx       # 등록 폼 (Client Component)
components/
  features/             # 화면별 복합 컴포넌트 (PostCard, UploadForm 등)
  ui/                   # shadcn/ui 컴포넌트 (자동 생성, 직접 편집 금지)
  theme-provider.tsx    # ThemeProvider 래퍼
services/notion.ts      # Notion API 래퍼 (서버사이드 전용)
types/notion.ts         # StudyPost 인터페이스
constants/index.ts      # SITE_NAME, SITE_DESCRIPTION
lib/utils.ts            # cn() 유틸리티
hooks/                  # 클라이언트 커스텀 훅
```

- `components/features/` — 화면 단위 복합 컴포넌트 배치
- `components/ui/` — `pnpm dlx shadcn@latest add <name>`으로만 추가, 직접 파일 생성 금지
- `hooks/` — 클라이언트 전용 훅만 배치 (서버 로직 금지)

---

## Path Aliases

- `@/*` → 레포 루트 (src/ 아님)
- `@/components` · `@/lib` · `@/hooks` · `@/components/ui` · `@/services` · `@/types` · `@/constants`
- **절대 경로 `../` 상대 임포트 금지** — 항상 `@/` 별칭 사용

---

## Notion API Rules

### 올바른 메서드 (v5.20.0 기준)

| 작업 | 메서드 | 파라미터 키 |
|------|--------|-------------|
| 목록 조회 | `notion.dataSources.query()` | `data_source_id` |
| 단일 조회 | `notion.pages.retrieve()` | `page_id` |
| 생성 | `notion.pages.create()` | `parent.database_id` |

- **`notion.databases.query` 사용 금지** — v5에 존재하지 않음
- Notion API 호출은 **서버사이드(Server Component, Server Action, API Route)에서만** 허용
- `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 클라이언트 코드에 절대 임포트 금지 (`NEXT_PUBLIC_` 접두사 금지)

### DB 스키마 (Notion 컬럼 → StudyPost 필드)

| Notion 컬럼 | 타입 | StudyPost 필드 |
|-------------|------|----------------|
| StudyTitle | Title | `studyTitle` |
| Writer | Rich Text | `writer` |
| StudyNote | Rich Text | `studyNote` |
| StudyRef | URL | `studyRef` |
| StudyImg | URL | `studyImg` |

- `StudyPost` 인터페이스 변경 시 → `types/notion.ts` + `services/notion.ts` 매핑 동시 수정 필수

---

## Styling Rules

- **Tailwind v4** — `tailwind.config.js` 없음. 테마 토큰(색상·radius·폰트)은 `app/globals.css`의 `@theme inline` 블록에서만 수정
- 색상 값은 **OKLch 색공간** 사용: `oklch(L C H)`
- 다크 모드: `next-themes` class 전략 — `.dark` 클래스 기반, `dark:` 유틸리티 사용

### 아이콘

- **`@phosphor-icons/react` 전용** — `lucide-react` 임포트 금지
- 사용 예: `import { ArrowLeft } from '@phosphor-icons/react'`

### shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add <컴포넌트명>
```

- `components/ui/` 내 파일 직접 생성·편집 금지
- `components.json` 설정: style=`radix-lyra`, baseColor=`neutral`, iconLibrary=`phosphor`

---

## Layout Provider Chain

`app/layout.tsx`의 프로바이더 순서를 반드시 유지:

```
ThemeProvider
  └── TooltipProvider
        ├── {children}
        └── <Toaster />
```

- 새 전역 프로바이더는 `TooltipProvider` 안쪽에 추가
- `<Toaster />`는 `{children}` 뒤에 위치 유지

---

## TypeScript Rules

- `tsconfig.json`: `strict: true` · `noUnusedLocals: true` · `noUnusedParameters: true`
- **미사용 변수·파라미터 → 빌드 에러** — 커밋 전 `pnpm type-check` 실행
- `any` 타입 사용 시 반드시 주석으로 이유 명시
- 코드 변경 후 `pnpm build` 에러 0건 확인 필수

---

## Image Rules

- 외부 이미지 URL을 `next/image`로 렌더링 시 `next.config.ts`의 `remotePatterns`에 도메인 추가 필수
- Notion S3 URL(`prod-files-secure.s3.us-east-1.amazonaws.com`)은 ~1시간 후 만료 — `next/image` 프록시 또는 외부 영구 URL 전략 사용

---

## Environment Variables

| 변수 | 용도 |
|------|------|
| `NOTION_API_KEY` | Notion Integration 시크릿 (서버 전용) |
| `NOTION_DATABASE_ID` | Notion 데이터베이스 ID (서버 전용) |

- 환경변수 추가 시 → `.env.example` + `CLAUDE.md` 환경변수 섹션 **동시** 업데이트 필수
- `.env.local`은 `.gitignore`에 포함 — 절대 커밋 금지

---

## Multi-File Coordination Rules

| 작업 | 동시 수정 파일 |
|------|---------------|
| 새 라우트 추가 | `app/[route]/page.tsx` 생성 + `.claude/docs/ROADMAP.md` 반영 |
| `StudyPost` 필드 변경 | `types/notion.ts` + `services/notion.ts` |
| 환경변수 추가 | `.env.example` + `CLAUDE.md` |
| 사이트 메타데이터 변경 | `constants/index.ts` + `app/layout.tsx` metadata |
| 외부 이미지 도메인 추가 | `next.config.ts` remotePatterns |
| 새 전역 프로바이더 추가 | `app/layout.tsx` 프로바이더 체인 |

---

## Workflow Standards

### Server Component vs Client Component 판단

- Notion API 호출 필요 → **Server Component** (default)
- `useState`, `useEffect`, 이벤트 핸들러, 브라우저 API 필요 → **Client Component** (`'use client'` 선언)
- 폼 제출(`createPost`) → Server Action 또는 API Route, 클라이언트가 Notion에 직접 접근 금지

### 새 기능 추가 순서

1. `types/notion.ts` 타입 정의 확인/수정
2. `services/notion.ts` API 메서드 추가/수정
3. `components/features/` 컴포넌트 구현
4. `app/` 페이지에서 컴포넌트 조합
5. `pnpm type-check` → `pnpm build` 순서로 검증

### E2E 검증

- 테스트 러너 없음 — **Playwright MCP**로 직접 브라우저 검증
- `pnpm dev` 실행 후 `browser_navigate` → `browser_snapshot`으로 렌더링 확인

---

## Prohibited Actions

- `notion.databases.query()` 호출 — v5에 존재하지 않음
- `import { ... } from 'lucide-react'` — Phosphor 아이콘 사용
- 환경변수에 `NEXT_PUBLIC_` 접두사로 Notion 키 노출
- `tailwind.config.js` 파일 생성 — Tailwind v4에서 불필요
- `components/ui/` 내 파일 직접 생성 또는 수동 편집
- 상대 경로(`../`) 임포트 — `@/` 별칭 사용
- 미사용 변수를 `_` 접두사로 우회 — 실제로 제거하거나 사용
- `.env.local` 파일 커밋
- Notion API 호출을 클라이언트 컴포넌트에서 직접 수행
