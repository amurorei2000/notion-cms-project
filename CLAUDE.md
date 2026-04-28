# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 명령어

```bash
pnpm dev          # 개발 서버 실행 (localhost:3000)
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint 검사
pnpm lint:fix     # ESLint 자동 수정
pnpm format       # Prettier 전체 포맷
pnpm format:check # Prettier 검사 (파일 변경 없음)
pnpm type-check   # tsc --noEmit (빌드 산출물 없음)
```

테스트 러너는 아직 설정되지 않았다. E2E 검증은 대화 중 **Playwright MCP**를 직접 사용한다.

## Next.js 버전 주의

현재 사용 중인 Next.js(v16)는 훈련 데이터의 Next.js와 **다를 수 있다**. 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 읽는다. Deprecation 경고를 반드시 확인한다.

## 아키텍처

### 데이터 흐름

Notion API 호출은 **서버 사이드에서만** 발생한다. `NOTION_API_KEY`와 `NOTION_DATABASE_ID`는 클라이언트에 절대 노출되지 않는다.

```
Server Component / Server Action
  → services/notion.ts      # Notion API 래퍼
  → types/notion.ts         # StudyPost 인터페이스
  → Client 렌더링
```

콘텐츠 등록(`createPost`)은 Next.js Server Action 또는 API Route를 통한다. 클라이언트 폼이 Notion에 직접 접근하지 않는다.

### 라우트 구조

| 경로 | 컴포넌트 유형 | 역할 |
|------|-------------|------|
| `/` | Server Component | 콘텐츠 목록 (`getPosts`) |
| `/posts/[id]` | Server Component | 포스트 상세 (`getPost`) |
| `/upload` | Client Component | 콘텐츠 등록 폼 (`createPost`) |

### 알려진 버그 — Notion API 호출 오류

`services/notion.ts`가 현재 존재하지 않는 메서드를 호출하고 있다:

```ts
// 잘못된 코드 (현재 상태)
notion.dataSources.query({ data_source_id: DATABASE_ID, ... })

// 올바른 코드
notion.databases.query({ database_id: DATABASE_ID, ... })
```

Notion 연동 작업 시 반드시 먼저 수정한다.

### 경로 별칭

`@/*`는 `src/`가 아닌 **레포 루트**에 매핑된다. 예: `@/services/notion` → `./services/notion.ts`.

### 스타일링

Tailwind **v4**를 사용한다 — `tailwind.config.js`가 없다. 테마 토큰(색상, radius, 폰트)은 `app/globals.css`에 OKLch 색공간 CSS 변수로 정의된다. 다크 모드는 `next-themes`의 `class` 전략을 사용한다.

shadcn/ui 설정:
- 아이콘 라이브러리: **Phosphor** (`@phosphor-icons/react`) — 기본 shadcn이 사용하는 Lucide와 다르다
- 스타일: `radix-lyra`, 베이스 색상: `neutral`
- 새 컴포넌트 추가: `pnpm dlx shadcn@latest add <컴포넌트명>`

### 전역 프로바이더 (`app/layout.tsx`)

`ThemeProvider` → `TooltipProvider` → `{children}` + `<Toaster />` 체인. 새 전역 프로바이더는 이 체인 안에 추가한다.

### TypeScript 엄격 설정

`tsconfig.json`에 `noUnusedLocals`와 `noUnusedParameters`가 활성화되어 있다. **미사용 변수는 빌드 에러**가 된다. 커밋 전 `pnpm type-check`를 실행한다.

### 이미지 최적화

`next.config.ts`의 `remotePatterns`가 현재 비어 있다. `next/image`로 Notion 호스팅 이미지를 사용하려면 Notion S3 도메인(`prod-files-secure.s3.us-east-1.amazonaws.com`)을 추가해야 한다. Notion S3 URL은 ~1시간 후 만료되므로 영구 이미지 소스 전략도 별도로 수립해야 한다.

## 환경 변수

`.env.example`을 복사해 `.env.local`을 생성한다:

```
NOTION_API_KEY=secret_...
NOTION_DATABASE_ID=...
```

`services/notion.ts`가 기대하는 Notion 데이터베이스 스키마:

| 컬럼 | 타입 |
|------|------|
| StudyTitle | Title |
| Writer | Rich Text |
| StudyNote | Rich Text |
| StudyRef | URL |
| StudyImg | URL |

## MCP 서버 (`.claude/settings.local.json`)

| 서버 | 용도 |
|------|------|
| **playwright** | E2E 브라우저 테스트. API 연동 및 UI 플로우 검증에 사용 |
| **context7** | 최신 라이브러리 문서 조회. Next.js·shadcn·`@notionhq/client` 코드 작성 전 사용 |
| **shadcn** | shadcn 컴포넌트 레지스트리 조회 |
| **sequential-thinking** | 복잡한 다단계 추론 |

## 프로젝트 문서

- `.claude/docs/PRD.md` — 제품 요구사항
- `.claude/docs/ROADMAP.md` — 5단계 개발 계획 (현재: Phase 1~2 진행 중)
