# 팀 스터디 블로그 — 로드맵

> **최종 업데이트**: 2026-04-28
> **버전**: 1.2.0
> **상태**: 활성

---

## 개요

팀 스터디 블로그는 Notion을 CMS(Content Management System)로 활용하여 LLM 서빙 팀의 스터디 내용을 공유하고 관리하는 웹 애플리케이션이다. Notion API를 백엔드 데이터 소스로 사용함으로써 비개발자도 Notion 인터페이스에서 직접 콘텐츠를 작성·편집할 수 있으며, 웹 사이트는 그 내용을 실시간으로 반영한다.

핵심 가치 제안은 세 가지다. 첫째, Notion 데이터베이스를 단일 진실 공급원(Single Source of Truth)으로 삼아 별도 CMS 관리 오버헤드를 제거한다. 둘째, 팀원이 스터디 내용을 웹 UI에서 직접 등록할 수 있어 콘텐츠 생산 마찰을 줄인다. 셋째, Next.js 기반의 서버 컴포넌트 아키텍처로 초기 로딩 성능을 확보하고 반응형 뷰를 기본 제공한다.

전략적 목표는 MVP를 빠르게 배포하여 팀 내 실제 사용을 통한 피드백 루프를 구축하고, 이후 UI 완성도·성능·접근성을 점진적으로 개선하는 것이다.

---

## 목표 & 성공 지표

| # | 목표 | 측정 지표 | 달성 기준 |
|---|------|-----------|-----------|
| 1 | Notion CMS 연동 완료 | Notion DB 읽기/쓰기 성공률 | 에러율 0% (정상 네트워크 환경) |
| 2 | 3개 핵심 화면 구현 | 콘텐츠 목록 / 등록 / 상세 보기 페이지 동작 | Playwright MCP E2E 검증 통과 |
| 3 | 반응형 웹 구현 | 모바일(375px) · 태블릿(768px) · 데스크톱(1280px) 레이아웃 | Lighthouse 모바일 점수 ≥ 80 |
| 4 | 콘텐츠 목록 정렬 | 최신 등록 순 내림차순 | created_time 기준 정렬 정확도 100% |
| 5 | 빌드 안정성 | CI 빌드 성공 | `pnpm build` 에러 0건 |

> 💡 가정: 별도 사용자 인증(로그인) 기능은 MVP 범위 외로 간주한다. 콘텐츠 등록 화면은 인증 없이 접근 가능한 내부 팀 전용 페이지로 운영한다.

---

## 기술 아키텍처 개요

### 현재 확정된 기술 스택

| 레이어 | 기술 | 선택 근거 |
|--------|------|-----------|
| 프레임워크 | Next.js 16 (App Router) | 서버 컴포넌트로 Notion API 호출을 서버 사이드에서 처리, API 키 노출 방지 |
| 언어 | TypeScript 5 | 타입 안전성으로 Notion API 응답 파싱 오류 조기 감지 |
| UI 라이브러리 | React 19 | 최신 동시성 기능, Server Actions 활용 가능 |
| 스타일링 | Tailwind CSS v4 + shadcn/ui | 유틸리티 클래스 기반 빠른 개발, 접근성 검증된 컴포넌트 |
| 아이콘 | Lucide React | shadcn/ui와 디자인 일관성 |
| CMS | Notion API (`@notionhq/client` v5) | 비개발자 콘텐츠 관리, 별도 DB 불필요 |
| 패키지 매니저 | pnpm | 이미 적용됨 (`pnpm-lock.yaml` 존재) |
| 토스트 알림 | Sonner | 이미 레이아웃에 `<Toaster />` 통합됨 |

### 아키텍처 결정 사항

**데이터 흐름 패턴**
- 콘텐츠 목록·상세 조회: Next.js Server Component → Notion API → 클라이언트 렌더링
- 콘텐츠 등록: 클라이언트 폼 → Next.js Server Action → Notion API `pages.create`
- 환경 변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID`는 서버 사이드 전용으로 노출 금지

**디렉토리 구조 (현행 기준)**

```
app/
  page.tsx              # 콘텐츠 목록 (/) — Server Component
  posts/
    [id]/
      page.tsx          # 포스트 상세 (/posts/[id]) — Server Component
  upload/
    page.tsx            # 콘텐츠 등록 (/upload) — Client Component
services/
  notion.ts             # Notion API 래퍼 (getPosts, getPost, createPost)
types/
  notion.ts             # StudyPost 인터페이스
components/
  features/             # 화면별 복합 컴포넌트
  ui/                   # shadcn/ui 기본 컴포넌트
constants/
  index.ts              # SITE_NAME, SITE_DESCRIPTION
```

> 💡 가정: `services/notion.ts`의 `notion.dataSources.query` 호출은 실제 Notion SDK API와 호환성 검증이 필요하다. `databases.query`가 표준 API이므로 통합 테스트 시 확인 필요 — Phase 2 마일스톤에 포함.

**ADR이 필요한 영역**
- ADR-001: `dataSources.query` vs `databases.query` API 선택 (현재 코드 불일치 가능성)
- ADR-002: 이미지 최적화 전략 — Notion 이미지 URL 직접 사용 vs `next/image` 프록시

---

## 개발 단계

### Phase 1: 프로젝트 골격 — 구조 & 환경 설정
**기간**: 1주 (2026-04-27 ~ 2026-05-03)
**목표**: 모든 팀원이 동일한 환경에서 즉시 개발을 시작할 수 있는 기반 완성

> **왜 이 순서인가?** 환경 불일치와 설정 오류는 이후 모든 개발 작업을 막는 선행 장벽이다. 공통 모듈이나 기능을 개발하기 전에 "코드가 실행되는 상태"를 먼저 보장해야 한다. 이 단계가 불완전하면 팀원마다 다른 오류를 겪으며 디버깅 시간이 낭비된다.

#### 마일스톤

**환경 & 설정**
- [x] ⚡ 크리티컬 패스 — pnpm 패키지 설치 완료 (`@notionhq/client` v5 포함) 🟢
- [x] ⚡ 크리티컬 패스 — Next.js App Router 프로젝트 구조 초기화 🟢
- [x] ⚡ 크리티컬 패스 — Tailwind CSS v4 + shadcn/ui 기본 설정 완료 🟢
- [ ] ⚡ 크리티컬 패스 — `.env.local` 템플릿 파일 생성 (`.env.example`) 🟢
  - `NOTION_API_KEY=`, `NOTION_DATABASE_ID=` 두 변수 포함
- [ ] ⚡ 크리티컬 패스 — Notion 데이터베이스 생성 및 스키마 설정 🟡
  - StudyTitle (Title), Writer (Rich Text), StudyNote (Rich Text), StudyRef (URL), StudyImg (URL) 컬럼 확인
- [ ] Notion Integration 생성 및 데이터베이스에 연결 권한 부여 🟢

**코드 품질 도구**
- [x] ESLint + Prettier 설정 완료 🟢
- [x] TypeScript strict 모드 설정 확인 (`tsconfig.json`) 🟢
- [ ] `pnpm build` 클린 빌드 통과 확인 🟢

#### 산출물
- `.env.example` 파일 (저장소 커밋용)
- 동작하는 Notion 데이터베이스 (샘플 데이터 1~2건 포함)
- 로컬에서 `pnpm dev` 실행 시 에러 없는 초기 페이지

#### 완료 기준
- `pnpm dev` 실행 후 `localhost:3000` 접속 시 "팀 스터디 블로그" 헤딩 노출
- `pnpm build` 에러 0건

---

### Phase 2: 공통 모듈 — 모든 기능이 공유하는 기반
**기간**: 1주 (2026-05-04 ~ 2026-05-10)
**목표**: 모든 페이지가 의존하는 API 래퍼·타입·레이아웃을 완성하여 이후 기능 개발에서 중복 작업 제거

> **왜 이 순서인가?** 핵심 기능을 개발하기 전에 공통 기반이 확정되어야 한다. Notion API 래퍼가 잘못 구현된 상태에서 3개 화면을 모두 만들면, API 수정 시 3곳을 동시에 고쳐야 하는 상황이 생긴다. 공통 모듈을 먼저 검증하고 안정화하면 이후 기능 개발 속도가 크게 빨라진다.

#### 마일스톤

**Notion API 래퍼 완성**
- [ ] ⚡ 크리티컬 패스 — `services/notion.ts` API 메서드 검증 — `databases.query` 정확한 호출 방식 확인 🟡
- [ ] 🧪 테스트: Playwright MCP로 `getPosts()` 실제 Notion API 응답 확인 (상태 코드, 반환 데이터 구조 검증) 🟡
- [ ] `types/notion.ts` StudyPost 인터페이스 확정 + 런타임 유효성 검사 추가 (zod 또는 타입 가드) 🟡
  - Notion DB 스키마 변경 시 silent failure 방지

**공통 레이아웃 컴포넌트**
- [ ] ⚡ 크리티컬 패스 — 헤더 컴포넌트 구현 — 사이트명, 콘텐츠 등록 링크 포함 🟢
- [ ] 글로벌 헤더 & 푸터 레이아웃 적용 🟢
- [ ] Sonner `<Toaster />` 통합 동작 확인 🟢
- [ ] ThemeProvider 다크 모드 기반 동작 확인 🟢

#### 산출물
- 검증된 `services/notion.ts` (`getPosts`, `getPost`, `createPost`)
- 런타임 유효성 검사가 포함된 `types/notion.ts`
- 재사용 가능한 헤더 컴포넌트

#### 완료 기준
- `services/notion.ts`의 `getPosts()` 호출 시 Notion DB에서 데이터 반환 확인
- Playwright MCP로 Notion API 연동 응답 데이터 구조 검증 통과
- `pnpm dev` 실행 시 헤더·토스트 정상 렌더링

---

### Phase 3: 핵심 기능 — 게시판 3개 화면 구현
**기간**: 3주 (2026-05-11 ~ 2026-05-31)
**목표**: 콘텐츠 목록·등록·상세 보기 3개 화면을 완성하고 Notion 연동 CRUD 전체 흐름 검증

> **왜 이 순서인가?** 공통 모듈이 안정화된 이후에 각 화면을 구현한다. 3개 화면은 병렬 개발이 가능하지만, 읽기(목록 → 상세) 기능을 먼저 안정화한 뒤 쓰기(등록)를 연동하면 데이터 흐름을 단계적으로 검증할 수 있어 디버깅 비용이 낮아진다.

#### 마일스톤

**3-A: 콘텐츠 목록 페이지 (`/`)** — 1주 (2026-05-11 ~ 2026-05-17)
- [ ] ⚡ 크리티컬 패스 — Server Component에서 `getPosts()` 호출 및 데이터 렌더링 🟡
- [ ] 🧪 테스트: Playwright MCP로 목록 페이지(`/`) 접속 후 Notion DB 데이터 렌더링 확인 (카드 개수, 필드 표시 검증) 🟡
- [ ] ⚡ 크리티컬 패스 — 포스트 카드 컴포넌트 (`components/features/PostCard.tsx`) 구현 🟡
  - StudyTitle, Writer, StudyNote 요약(앞 100자), 등록일, StudyImg 표시
- [ ] 최신 순 내림차순 정렬 적용 — `sorts: [{ timestamp: 'created_time', direction: 'descending' }]` 🟢
- [ ] 🧪 테스트: Playwright MCP로 목록 페이지 카드 순서가 최신 등록 순임을 created_time 비교로 검증 🟢
- [ ] 포스트 카드 → 상세 보기 페이지 링크 연결 (`/posts/[id]`) 🟢

**3-B: 콘텐츠 등록 페이지 (`/upload`)** — 1주 (2026-05-18 ~ 2026-05-24)
- [ ] ⚡ 크리티컬 패스 — 등록 폼 컴포넌트 (`components/features/UploadForm.tsx`) 구현 🟡
  - StudyTitle (필수), Writer (필수), StudyNote (필수, textarea), StudyRef (URL, 선택), StudyImg (URL, 선택) 입력 필드
- [ ] ⚡ 크리티컬 패스 — Server Action 또는 API Route로 `createPost()` 연동 🔴
- [ ] 🧪 테스트: Playwright MCP로 등록 폼 제출 후 Notion DB 신규 레코드 생성 확인 (성공/실패/네트워크 에러 시나리오) 🔴
- [ ] 필수 필드 클라이언트 사이드 유효성 검사 🟢
- [ ] 🧪 테스트: Playwright MCP로 필수 필드 누락 시 제출 차단 및 에러 메시지 표시 검증 🟢
- [ ] 제출 성공 시 목록 페이지(`/`)로 리디렉션 + Sonner 토스트 성공 알림 🟢
- [ ] 🧪 테스트: Playwright MCP로 제출 성공 후 `/` 리디렉션 및 토스트 알림 표시 E2E 검증 🟢
- [ ] 제출 실패 시 Sonner 토스트 에러 알림 + 입력 데이터 보존 🟡
- [ ] 🧪 테스트: Playwright MCP로 API 에러 주입 시 에러 토스트 표시 및 입력값 유지 검증 🟡

**3-C: 포스트 상세 보기 페이지 (`/posts/[id]`)** — 1주 (2026-05-25 ~ 2026-05-31)
- [ ] ⚡ 크리티컬 패스 — Server Component에서 `getPost(id)` 호출 및 상세 렌더링 🟡
- [ ] 🧪 테스트: Playwright MCP로 `/posts/[id]` 접속 후 Notion API 응답 데이터(제목, 작성자, 내용) 정상 렌더링 검증 🟡
- [ ] StudyImg가 있을 경우 이미지 표시, 없을 경우 플레이스홀더 처리 🟢
- [ ] StudyRef가 있을 경우 외부 링크 버튼/앵커 표시 🟢
- [ ] StudyNote 전문 표시 (줄바꿈 보존) 🟢
- [ ] 존재하지 않는 포스트 접근 시 `notFound()` 처리 🟢
- [ ] 🧪 테스트: Playwright MCP로 존재하지 않는 ID 접근 시 404 페이지 반환 검증 🟢
- [ ] 목록 페이지로 돌아가는 뒤로가기 링크 🟢

#### 산출물
- `/` 콘텐츠 목록 페이지 (실제 Notion 데이터 연동)
- `/upload` 콘텐츠 등록 페이지 (Notion DB에 실제 저장)
- `/posts/[id]` 포스트 상세 페이지

#### 완료 기준
- Notion DB에서 포스트 조회 → 목록 화면 정상 렌더링
- 등록 폼 작성 후 제출 → Notion DB에 신규 레코드 생성 확인 → 목록 화면 자동 반영
- 존재하는 포스트 ID로 `/posts/[id]` 접근 시 상세 정보 정상 표시
- 존재하지 않는 ID 접근 시 404 페이지 표시
- Playwright MCP로 목록 조회 → 등록 → 상세 보기 E2E 흐름 전체 검증 통과
- `pnpm build` 에러 0건

---

### Phase 4: 추가 기능 — UX 완성도 & 반응형
**기간**: 2주 (2026-06-01 ~ 2026-06-14)
**목표**: 빈 상태·로딩·에러 처리와 반응형 레이아웃을 추가하여 실사용 가능한 수준의 UX 완성

> **왜 이 순서인가?** 핵심 기능이 동작한 후에 UX를 다듬는다. 데이터가 없거나 요청이 실패하는 엣지 케이스, 다양한 화면 크기 대응은 기능 자체보다 덜 긴급하다. 핵심 기능 검증 이후에 작업해야 실제 사용 패턴을 반영한 UX 결정을 내릴 수 있고 수정 범위도 최소화된다.

#### 마일스톤

**4-A: 상태 처리 UI** — 1주 (2026-06-01 ~ 2026-06-07)
- [ ] 빈 목록 상태 UI 처리 (데이터가 없을 때 안내 메시지) 🟢
- [ ] 로딩 상태 처리 (`loading.tsx` 또는 Suspense 경계 추가) 🟡
- [ ] 제출 중 로딩 상태 표시 (버튼 disabled + 스피너) 🟢
- [ ] 빈 목록 / 로딩 / 에러 상태 UI 일관성 정비 🟡
- [ ] 페이지 `<title>` 및 `<meta description>` 동적 생성 (`generateMetadata`) 🟡

**4-B: 반응형 레이아웃 & 시각 개선** — 1주 (2026-06-08 ~ 2026-06-14)
- [ ] ⚡ 크리티컬 패스 — 모바일(375px) · 태블릿(768px) · 데스크톱(1280px) 반응형 레이아웃 검증 🟡
- [ ] 목록 페이지 그리드 레이아웃 — 모바일 1열 / 태블릿 2열 / 데스크톱 3열 🟡
- [ ] 다크 모드 지원 — 컴포넌트별 다크 변형 확인 🟡
- [ ] 포스트 카드 hover 인터랙션 (shadow, scale 트랜지션) 🟢

#### 산출물
- 빈 상태·로딩·에러 UI가 완성된 3개 페이지
- 3개 뷰포트 기준 반응형 레이아웃
- 다크 모드 지원

#### 완료 기준
- 빈 Notion DB 상태에서 안내 메시지 정상 표시
- 375px 뷰포트에서 모든 페이지 레이아웃 깨짐 없음
- 다크 모드 전환 시 모든 화면 정상 표시

---

### Phase 5: 최적화 & 배포
**기간**: 1주 (2026-06-15 ~ 2026-06-21)
**목표**: 이미지 최적화·접근성 개선으로 Lighthouse 점수 기준을 달성하고 프로덕션 배포 완료

> **왜 이 순서인가?** 최적화는 기능이 완성된 후에 한다. 개발 중 최적화를 섣불리 적용하면 코드가 복잡해지고 변경 비용이 커진다. 모든 기능과 UX가 검증된 마지막 단계에서 성능·접근성을 일괄 개선하는 것이 효율적이며, 실제 데이터 기반으로 병목 지점을 정확히 파악할 수 있다.

#### 마일스톤

**성능 & 접근성**
- [ ] ⚡ 크리티컬 패스 — `next/image` 적용 — StudyImg URL 렌더링에 Image 컴포넌트 사용, `remotePatterns` 설정 🟡
- [ ] 이미지 로딩 실패 시 fallback 이미지 처리 🟢
- [ ] 시맨틱 HTML 점검 — `<article>`, `<header>`, `<main>`, `<nav>` 태그 적절성 🟢
- [ ] 폼 접근성 — `<label>` 연결, `aria-required`, 키보드 탐색 🟡
- [ ] `pnpm build` 후 번들 크기 확인 및 불필요 의존성 제거 🟢
- [ ] Lighthouse 모바일 점수 측정 및 ≥ 80 달성 🟡

**배포**
- [ ] `.env.example` 파일이 저장소에 커밋됨 (실제 키 제외)
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] `next.config.ts`의 `remotePatterns`에 사용 이미지 도메인 추가
- [ ] Vercel 환경 변수 설정 완료 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [ ] `pnpm build` 성공 확인 후 프로덕션 배포

#### 산출물
- Lighthouse 모바일 점수 보고서 (스크린샷)
- 프로덕션 배포 URL

#### 완료 기준
- Lighthouse 모바일 Performance ≥ 80, Accessibility ≥ 90
- 프로덕션 URL에서 전체 CRUD 흐름 동작 확인

---

## 의존성 맵

```
Phase 1 (프로젝트 골격)
  └── Notion DB 생성 + API 키 확보
        └── Phase 2 (공통 모듈)
              └── services/notion.ts 검증 완료
                    └── Phase 3 (핵심 기능)
                          ├── 3-A, 3-B, 3-C 병렬 진행 가능
                          └── Phase 4 (추가 기능)
                                └── Phase 5 (최적화 & 배포)
```

**외부 의존성**

| 의존성 | 용도 | 리스크 수준 |
|--------|------|-------------|
| Notion API (`@notionhq/client`) | CMS 데이터 소스 | 중간 (rate limit: 3 req/s) |
| Vercel / 배포 플랫폼 (미결정) | 프로덕션 호스팅 | 낮음 |

---

## 리스크 & 대응 방안

| # | 리스크 | 발생 가능성 | 영향도 | 대응 전략 |
|---|--------|-------------|--------|-----------|
| 1 | **Notion API `dataSources.query` 호환성 문제** — 현재 `services/notion.ts`에서 `notion.dataSources.query`를 사용하나, `@notionhq/client` v5 공식 API는 `databases.query`이다. | 높음 | 높음 | Phase 2 완료 기준에 실제 API 호출 검증 포함. 오류 발생 시 `notion.databases.query({ database_id: DATABASE_ID, ... })`로 즉시 교체. |
| 2 | **Notion API Rate Limit 초과** — 무료 Integration은 초당 3요청 제한이 있으며, 팀 다수가 동시 접속 시 429 에러 발생 가능. | 보통 | 보통 | Next.js `revalidate` 또는 ISR(Incremental Static Regeneration)로 캐싱 적용. 목록 페이지는 60초 revalidation 설정. |
| 3 | **Notion 이미지 URL 만료** — Notion이 반환하는 S3 서명 URL은 1시간 후 만료되어 `<img src>` 직접 사용 시 깨진 이미지 발생. | 높음 | 보통 | Phase 5에서 `next/image` 적용 시 이미지 프록시 또는 만료 처리 전략 수립. 단기적으로는 StudyImg 필드에 외부 영구 URL(imgur 등) 사용 가이드 팀 공유. |
| 4 | **Notion DB 스키마 변경 시 런타임 오류** — StudyPost 타입과 Notion 실제 컬럼명이 불일치하면 silent failure(빈 문자열 반환) 발생. | 보통 | 보통 | `types/notion.ts`의 StudyPost 인터페이스와 `services/notion.ts` 매핑 로직에 런타임 유효성 검사(zod 또는 수동 타입 가드) 추가. Phase 2(공통 모듈) 단계에서 적용. |
| 5 | **콘텐츠 등록 스팸 / 의도치 않은 데이터 오염** — 인증 없는 등록 페이지는 잘못된 데이터가 Notion DB에 누적될 위험. | 낮음 | 보통 | MVP는 팀 내부 사용이므로 URL 비공개 운영. 향후 접근 제어 강화 필요 시 Notion Integration 권한 제한 또는 간단한 비밀번호 게이트 추가. |

---

## 릴리스 전략

### MVP 릴리스 (Phase 3 완료 시점)
- 배포 플랫폼: Vercel 권장 (Next.js 공식 지원, 환경 변수 UI 제공, 무료 플랜 충분)
- 브랜치 전략: `main` → 프로덕션, `develop` → 스테이징
- 환경 변수: Vercel 대시보드에서 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 등록
- URL 공유: 팀 내부 Slack/Notion 링크 공유로 베타 테스트

### 최종 배포 (Phase 5 완료 시점)
- Lighthouse 점수 기준 달성 확인 후 정식 배포
- 배포 체크리스트는 Phase 5 마일스톤 항목으로 관리

---

## 지표 & 모니터링

### Phase 3 (핵심 기능) 기준 모니터링

| 지표 | 측정 방법 | 목표값 |
|------|-----------|--------|
| Notion API 에러율 | Next.js 서버 로그 / Vercel 함수 로그 | < 1% |
| 페이지 로딩 시간 | Vercel Analytics (무료) | LCP < 2.5초 |
| 빌드 성공률 | Vercel 배포 이력 | 100% |

---

## 미결 질문

1. **콘텐츠 등록 접근 제어**: `/upload` 페이지에 인증 게이트(팀 비밀번호 등)를 MVP에 포함할 것인가?
2. **배포 플랫폼**: Vercel 외 다른 플랫폼(사내 서버, AWS 등) 요구사항이 있는가?
3. **이미지 소스 정책**: StudyImg는 외부 URL을 입력하는 방식인가, 파일 직접 업로드를 지원할 것인가?

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 사항 |
|------|------|--------|-----------|
| 1.0.0 | 2026-04-27 | Claude (PRD 기반 자동 생성) | 최초 로드맵 작성 |
| 1.1.0 | 2026-04-28 | Claude | Phase 3 LLM 기능 제거 — 게시판 기능(목록/등록/상세)으로 범위 확정 |
| 1.2.0 | 2026-04-28 | Claude | 개발 단계 재구성 — 기능 중심에서 개발 순서 중심(골격→공통 모듈→핵심 기능→추가 기능→최적화/배포)으로 변경, 각 단계 "왜 이 순서인가?" 설명 추가 |
