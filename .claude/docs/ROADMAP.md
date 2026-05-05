# 팀 스터디 블로그 — 고도화 로드맵

> **최종 업데이트**: 2026-05-05
> **버전**: 2.0.0
> **상태**: 활성 (Phase 1–3 MVP 완료)

---

## 현재 구현 완료 (MVP)

Phase 1–3 기준 다음 기능이 동작 중이다.

| 기능 | 상태 | 비고 |
|------|------|------|
| Notion API fetch 직접 호출 | ✅ | `Notion-Version: 2022-06-28` 고정 |
| 콘텐츠 목록 페이지 (`/`) | ✅ | Server Component, 최신순 내림차순 |
| 콘텐츠 등록 페이지 (`/upload`) | ✅ | Server Action, 클라이언트 유효성 검사 |
| 포스트 상세 페이지 (`/posts/[id]`) | ✅ | 404 처리, 수정 기능 포함 |
| 포스트 수정 페이지 (`/posts/[id]/edit`) | ✅ | StudyNote 필드 수정 |
| 라이트/다크 모드 토글 | ✅ | Header에 Sun/Moon 아이콘 버튼 |
| 전역 레이아웃 (Header + Toaster) | ✅ | ThemeProvider → TooltipProvider 체인 |

---

## Phase 4: 레이아웃 고도화 — 좌측 사이드바 네비게이션

**기간**: 1주 (2026-05-06 ~ 2026-05-12)
**목표**: 전체 글 제목 목록을 좌측에 상시 노출하여 게시판 탐색 UX 개선

> **왜 이 순서인가?** MVP의 그리드 레이아웃은 포스트 수가 많아질수록 스크롤이 길어진다. 좌측 사이드바를 추가하면 어느 페이지에서도 전체 목록을 즉시 탐색할 수 있어 팀 블로그의 핵심 사용 패턴(목록 훑기 → 클릭 → 읽기)을 개선한다.

### 아키텍처 결정

```
app/
  layout.tsx          ← 사이드바 + 메인 콘텐츠 2단 레이아웃으로 변경
  page.tsx            ← 기존 그리드 유지 (메인 영역)
  posts/[id]/page.tsx ← 기존 상세 뷰 유지

components/
  features/
    Sidebar.tsx       ← 새 컴포넌트 (Server Component)
    SidebarLink.tsx   ← 현재 경로 하이라이트용 Client Component
```

**레이아웃 구조**

```
┌─────────────────────────────────────────┐
│                  Header                 │
├──────────────┬──────────────────────────┤
│   Sidebar    │     Main Content         │
│  (w-64 고정) │   (flex-1, 스크롤)       │
│              │                          │
│ • 글 제목1   │   현재 라우트 콘텐츠     │
│ • 글 제목2   │                          │
│ • 글 제목3   │                          │
│  ...         │                          │
└──────────────┴──────────────────────────┘
```

- 모바일(< 768px): 사이드바 숨김, 햄버거 메뉴 또는 상단 드롭다운 처리
- 태블릿(768px~): 사이드바 표시, 본문 축소
- 데스크톱(1280px~): 사이드바 고정, 본문 최대폭 제한

### 마일스톤

**4-A: Sidebar Server Component**
- [ ] ⚡ 크리티컬 패스 — `Sidebar.tsx` 구현 (Server Component에서 `getPosts()` 호출)
  - 제목 목록만 렌더링 — StudyTitle + createdAt 날짜
  - 최신순 내림차순 정렬 (Notion API 쿼리 그대로 활용)
- [ ] `SidebarLink.tsx` Client Component — `usePathname()`으로 현재 포스트 활성 스타일
- [ ] `app/layout.tsx` 2단 레이아웃 (`flex`, `aside` + `main`) 적용

**4-B: 반응형 처리**
- [ ] 모바일에서 사이드바 숨김 (`hidden md:block`)
- [ ] 모바일 글 목록 접근 방법 결정 (햄버거 드로어 vs 홈 페이지 그리드 유지)

**4-C: 스크롤 & 스타일**
- [ ] 사이드바 독립 스크롤 (`overflow-y-auto`, `sticky top-0 h-screen`)
- [ ] 현재 포스트 활성 상태 하이라이트 (배경 + 폰트 강조)
- [ ] 빈 목록 시 "등록된 글 없음" 안내

### 완료 기준

- 데스크톱에서 사이드바에 전체 글 제목이 최신순으로 표시
- 사이드바 링크 클릭 시 해당 포스트 상세 페이지로 이동
- 현재 보고 있는 포스트의 사이드바 항목이 시각적으로 활성화
- `pnpm type-check` 및 `pnpm build` 에러 0건

---

## Phase 5: 서버 최적화 — 캐싱 & API 호출 제어

**기간**: 1주 (2026-05-13 ~ 2026-05-19)
**목표**: Notion API Rate Limit 대응 및 페이지 응답 속도 개선

> **왜 이 순서인가?** 사이드바 추가 후 모든 페이지가 `getPosts()`를 호출하게 되면 Notion API Rate Limit(초당 3 req)에 빠르게 도달한다. 캐싱 전략이 없으면 팀원 동시 접속 시 429 에러가 발생한다. 기능 완성 직후 최적화를 적용해야 실 사용 환경에서 안정적으로 동작한다.

### 캐싱 전략

**Next.js `fetch` 캐싱 + `revalidate`**

```ts
// services/notion.ts — 목록 조회에 ISR 적용
const res = await fetch(`${NOTION_BASE}/databases/${DATABASE_ID}/query`, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({ ... }),
  next: { revalidate: 60 }, // 60초 캐시
});
```

| 요청 유형 | 전략 | revalidate |
|-----------|------|-----------|
| `getPosts()` (목록/사이드바) | ISR | 60초 |
| `getPost(id)` (상세) | ISR | 300초 |
| `createPost()` / `updatePost()` | 캐시 없음 + `revalidatePath` 호출 | - |

**`revalidatePath` 연동** — 글 등록/수정 Server Action 완료 후 관련 경로 무효화

```ts
// app/upload/actions.ts
import { revalidatePath } from 'next/cache';

export async function submitPost(...) {
  await createPost(...);
  revalidatePath('/');           // 목록 페이지
  revalidatePath('/posts/[id]', 'layout'); // 사이드바
}
```

### 마일스톤

**5-A: fetch 캐싱 적용**
- [ ] ⚡ 크리티컬 패스 — `getPosts()`에 `next: { revalidate: 60 }` 추가
- [ ] `getPost(id)`에 `next: { revalidate: 300 }` 추가
- [ ] `createPost()`, `updatePost()` 후 `revalidatePath` 호출 확인

**5-B: 오류 복원력 강화**
- [ ] Notion API 429 (Rate Limit) 응답 시 `Retry-After` 헤더 파싱 + 재시도 로직
- [ ] `getPost(id)` 실패 시 `notFound()` 대신 에러 경계 구분 처리 (네트워크 오류 ≠ 404)
- [ ] 환경 변수 미설정 시 명확한 에러 메시지 (`NOTION_API_KEY is not configured`)

**5-C: 성능 검증**
- [ ] `pnpm build` 후 빌드 출력에서 각 라우트 렌더링 전략 확인 (Static/ISR/Dynamic 구분)
- [ ] Vercel Analytics 또는 로컬 `next/headers` 로그로 캐시 히트율 확인

### 완료 기준

- 동일 내용의 `getPosts()` 연속 호출이 60초 내 Notion API를 재호출하지 않음
- 글 등록/수정 후 목록 페이지가 즉시 갱신됨 (`revalidatePath` 동작 확인)
- Notion API 호출 실패 시 500 페이지 대신 사용자 친화적 에러 메시지 표시

---

## Phase 6: 통합 테스트 — Playwright E2E

**기간**: 1주 (2026-05-20 ~ 2026-05-26)
**목표**: 핵심 사용자 플로우를 Playwright MCP로 자동 검증하여 회귀 방지

> **왜 이 순서인가?** 기능과 최적화가 완성된 시점에 E2E 테스트를 작성하면 현재 동작하는 상태를 기준으로 정확한 시나리오를 정의할 수 있다. 개발 중 작성하면 구현이 바뀔 때마다 테스트도 수정해야 한다.

### 테스트 시나리오

**6-A: 목록 페이지 (`/`)**
- [ ] Notion DB에서 포스트 데이터 렌더링 확인 (카드 개수 ≥ 1)
- [ ] 포스트 카드가 `created_time` 내림차순으로 정렬됨을 날짜 텍스트로 검증
- [ ] 사이드바에 포스트 제목 목록이 표시됨을 확인
- [ ] 사이드바 항목이 목록과 동일한 순서(최신순)임을 검증

**6-B: 사이드바 네비게이션**
- [ ] 사이드바 링크 클릭 → 해당 포스트 상세 페이지로 이동 확인
- [ ] 현재 포스트에 해당하는 사이드바 항목이 활성 스타일로 표시됨을 확인
- [ ] 데스크톱(1280px)에서 사이드바 가시성 검증
- [ ] 모바일(375px)에서 사이드바 숨김 확인

**6-C: 글 등록 플로우 (`/upload`)**
- [ ] 필수 필드 누락 시 제출 차단 및 에러 메시지 표시
- [ ] 유효한 데이터 제출 → Notion DB 신규 레코드 생성 → `/` 리디렉션 → 목록 갱신
- [ ] 성공 시 Sonner 토스트 알림 표시 확인

**6-D: 다크/라이트 모드 전환**
- [ ] Header의 테마 토글 버튼 클릭 → `<html>` 태그 `class`에 `dark` 추가/제거 확인
- [ ] 다크 모드 전환 후 배경색 변경 확인 (CSS 변수 적용)
- [ ] 페이지 리로드 후 테마 유지 확인 (localStorage 기반 next-themes 동작)

**6-E: 에러 처리**
- [ ] 존재하지 않는 포스트 ID → 404 페이지 반환 확인
- [ ] 뒤로가기 링크 → `/` 목록 페이지 이동 확인

### 완료 기준

- 위 모든 시나리오를 Playwright MCP로 실행하여 통과
- 테스트 실행 중 콘솔 에러 0건
- `pnpm build` 에러 0건

---

## Phase 7: 배포 & 최종 최적화

**기간**: 1주 (2026-05-27 ~ 2026-06-02)
**목표**: Vercel 프로덕션 배포 및 Lighthouse 기준 달성

### 마일스톤

**7-A: 이미지 최적화**
- [ ] `next/image` 적용 — `remotePatterns`에 Notion S3 도메인 추가
  ```ts
  // next.config.ts
  remotePatterns: [{ hostname: 'prod-files-secure.s3.us-east-1.amazonaws.com' }]
  ```
- [ ] S3 URL 만료(~1시간) 대응 — 외부 영구 URL 사용 가이드 팀 공유 또는 `revalidate` 주기 조정

**7-B: 접근성 & 시맨틱 HTML**
- [ ] `<article>`, `<aside>`, `<nav>`, `<main>` 태그 적절성 점검
- [ ] 폼 `<label>` 연결, `aria-required`, 키보드 탐색 검증
- [ ] 다크 모드 전체 컴포넌트 대비비(WCAG AA) 확인

**7-C: Vercel 배포**
- [ ] 환경 변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID` Vercel 대시보드 등록
- [ ] `pnpm build` 성공 확인 후 main 브랜치 → Vercel 자동 배포
- [ ] 프로덕션 URL에서 전체 CRUD 플로우 E2E 검증

**7-D: 성능 기준**
- [ ] Lighthouse 모바일 Performance ≥ 80
- [ ] Lighthouse Accessibility ≥ 90
- [ ] LCP < 2.5초 (Vercel Analytics)

### 완료 기준

- 프로덕션 URL에서 목록 → 상세 → 등록 → 수정 전체 플로우 동작
- Lighthouse 기준 달성 확인 (스크린샷 캡처)

---

## 의존성 맵

```
MVP (Phase 1–3) ✅
  └── Phase 4: 사이드바 레이아웃
        └── Phase 5: 서버 캐싱 최적화
              └── Phase 6: E2E 통합 테스트
                    └── Phase 7: 배포 & 최종 최적화
```

---

## 미결 사항

| # | 질문 | 결정 필요 시점 |
|---|------|--------------|
| 1 | 모바일에서 사이드바 접근 방법 — 햄버거 드로어 vs 홈 그리드 유지 | Phase 4 시작 전 |
| 2 | StudyImg 영구 URL 정책 — imgur 등 외부 호스팅 or 파일 업로드 | Phase 7 전 |
| 3 | `/upload` 접근 제어 — 팀 비밀번호 게이트 도입 여부 | Phase 7 전 |

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 사항 |
|------|------|--------|-----------|
| 2.0.0 | 2026-05-05 | Claude | MVP 완료 기준 재기술, Phase 4–7 고도화 로드맵 신규 작성 |
