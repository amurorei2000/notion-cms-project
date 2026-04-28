---
name: Notion CMS + Next.js 아키텍처 패턴
description: Notion API를 CMS로 사용하는 Next.js App Router 프로젝트의 공통 아키텍처 패턴 및 주의사항
type: project
---

Notion을 CMS로 활용하는 Next.js 프로젝트에서 반복적으로 나타나는 패턴과 주의사항.

**데이터 흐름 패턴**
- 조회: Server Component → services/notion.ts → Notion API (API 키 서버 사이드 보호)
- 등록: Client Form → Server Action or API Route → services/notion.ts → Notion API

**공통 리스크 패턴**
1. Notion 이미지 URL 만료 문제: S3 서명 URL은 1시간 후 만료됨 → next/image 프록시 또는 영구 URL 정책 필요
2. Notion API Rate Limit: 무료 Integration 3 req/s → ISR/캐싱으로 완화
3. SDK 버전별 API 메서드 불일치: dataSources.query vs databases.query — 반드시 실제 호출로 검증
4. DB 스키마 변경 시 silent failure: 타입 가드 또는 zod 런타임 검증 권장

**단계 기간 벤치마크 (Notion CMS 블로그 유형)**
- Phase 0 (환경 셋업): 1주
- Phase 1 (3개 핵심 화면 MVP): 3주
- Phase 2 (반응형 + 스타일링 완성): 2주
- Phase 3+ (LLM 기능 추가): 4주+

**Why:** 팀 스터디 블로그 PRD 분석 및 로드맵 생성 과정에서 도출된 패턴.
**How to apply:** 유사한 Notion CMS 프로젝트 로드맵 생성 시 이 패턴과 기간 벤치마크를 기준점으로 활용한다.
