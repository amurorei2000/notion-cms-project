---
name: Notion CMS 블로그 프로젝트 컨텍스트
description: 팀 스터디 블로그 프로젝트의 기술 스택, 현재 구현 상태, 주요 아키텍처 결정 사항
type: project
---

팀 스터디 블로그는 Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui + Notion API 기반 CMS 블로그다.

**현재 구현 상태 (2026-04-27 기준)**
- `@notionhq/client` v5 설치 완료
- `services/notion.ts`: getPosts, getPost, createPost 3개 메서드 구현됨
- `types/notion.ts`: StudyPost 인터페이스 정의됨 (id, studyTitle, writer, studyNote, studyRef, studyImg, createdAt)
- `app/page.tsx`: 기본 헤딩만 있는 초기 상태
- shadcn/ui Sonner 토스트, ThemeProvider(다크 모드), TooltipProvider 레이아웃에 통합됨
- 패키지 매니저: pnpm

**주요 리스크 (코드 검토 결과)**
- `services/notion.ts`에서 `notion.dataSources.query` 사용 중이나 표준 Notion SDK API는 `databases.query`임 — Phase 0에서 반드시 검증 필요

**Notion DB 스키마**
- StudyTitle (Title), Writer (Rich Text), StudyNote (Rich Text), StudyRef (URL), StudyImg (URL)

**미결 사항**
- LLM API 공급자 미결정 (Phase 3 시작 전 결정 필요)
- 배포 플랫폼 미결정 (Vercel 권장)
- 등록 페이지 접근 제어 방식 미결정

**Why:** PRD 기반 ROADMAP.md 생성 시 실제 코드 분석으로 확인한 사항들을 기록.
**How to apply:** 이 프로젝트에서 작업 시 services/notion.ts의 API 호환성 문제를 첫 확인 포인트로 삼는다.
