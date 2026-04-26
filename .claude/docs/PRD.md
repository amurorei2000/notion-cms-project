## 프로젝트 개요:
- 프로젝트명: 팀 스터디 블로그
- 목적: Notion을 CMS(Content Management System)으로 활용한 LLM 서빙 팀 스터디 블로그를 제작한다.
- CMS 선택 이유: Notion API를 활용하여 비개발자도 콘텐츠 관리 가능

## 주요 기능:
1. 특정 기능에 대해 LLM을 이용한 지식 검색 및 요약 기능
2. 검색 및 요약 내용을 자동으로 노션 페이지에 등록

## 기술 스택:
- FrontEnd: ReAct 19, TypeScript
- CMS: Notion API
- Styling: Tailwind CSS, shadcn/UI
- Icons: Lucide React

## Notion 데이터베이스 구조:
- StudyTitle: String - 스터디 주제에 대한 제목
- Writer: String - 작성자 아이디
- StudyNote: String - 스터디 내용에 대한 요약
- StudyRef: String - 참고 링크(URL)
- StudyImg: String - 이미지 URL

## 화면 구성:
- 콘텐츠 목록 화면: 업로드된 팀원 들의 스터디 목록을 표시한 페이지
- 콘텐츠 등록 화면: 스터디 제목, 내용(텍스트), 이미지 소스 및 참고 링크 URL 업로드 페이지
- 포스트 보기 화면: 콘텐츠 목록에서 선택된 포스트의 상세 내용을 표시하는 화면

## MVP 범위:
- 최초 랜딩 페이지인 콘텐츠 목록 화면, 콘텐츠 업로드 화면, 포스트 보기 화면을 만든다.
- 콘텐츠 목록은 최근 업로드 된 것부터 내림차순으로 정렬한다.
- Notion API 연동
- 반응형 웹 뷰
- 기본 스타일링

## 구현 단계:
1. Notion API 패키지 설치 및 환경 설정
2. Notion 데이터베이스 생성 및 API 키 설정
3. 콘텐츠 목록 페이지 구현
4. 게시글 업로드 페이지 구현
5. 게시글 보기 페이지 구현
5. 스타일링 및 최적화