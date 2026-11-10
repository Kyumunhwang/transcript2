# TASKS.md - 등대교육공동체 진학상담포탈 구현 로드맵 및 백로그

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Reference Documents:** `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `DESIGN.md`  
> **Management Rule:** 각 태스크를 완료할 때마다 체크박스(`[x]`)를 갱신하며, 빌드 테스트(`pnpm tsc --noEmit`) 통과를 전제로 한다.

---

## Phase 1: 프로젝트 초기 세팅, 폴더 구조 및 디자인 시스템 구축
- [x] [TASK-101] 프로젝트 초기 세팅 및 핵심 패키지 의존성 설치
  - **(1) 목표 및 내용:** Next.js 15 (App Router, TypeScript) 프로젝트 초기화 및 `ARCHITECTURE.md`에 명시된 필수 패키지(`@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `recharts`, `lucide-react`, `pdf-parse` 또는 `unpdf`) 설치.
  - **(2) 대상 파일:** `package.json`, `tsconfig.json`, `pnpm-lock.yaml`
  - **(3) 완료 조건:** `pnpm install` 성공 및 `pnpm dev` 실행 시 에러 없이 서버가 기동됨.

- [x] [TASK-102] 아키텍처 기준 디렉토리 트리 구조 생성
  - **(1) 목표 및 내용:** `ARCHITECTURE.md`의 디렉토리 구조에 맞춰 `src/app/(portal)`, `src/components/{ui,shared,dashboard,transcript,records,counseling,universities}`, `src/lib/{supabase,pdf-parser,actions,validations}`, `src/hooks`, `src/stores`, `src/types` 폴더 생성.
  - **(2) 대상 파일:** 디렉토리 전용 `.gitkeep` 또는 빈 디렉토리 구성
  - **(3) 완료 조건:** 모든 지정된 디렉토리 경로가 누락 없이 생성됨.

- [x] [TASK-103] Tailwind CSS 디자인 토큰 및 노션 스타일 테마 설정
  - **(1) 목표 및 내용:** `DESIGN.md`에 정의된 컬러 팔레트(`#FAFAFA`, `#37352F`, `#2383E2` 등), 폰트(Pretendard), 모서리 곡률(`rounded-sm/md/lg`), 그림자 설정을 Tailwind 설정 파일에 반영.
  - **(2) 대상 파일:** `tailwind.config.ts`, `src/app/globals.css`
  - **(3) 완료 조건:** 정의된 커스텀 CSS 변수와 컬러가 클래스(`bg-[#FAFAFA]`, `text-[#37352F]`)로 정상 렌더링됨.

---

## Phase 2: 데이터베이스 스키마 및 인증(Auth) 플로우 구현
- [x] [TASK-201] Supabase 데이터베이스 마이그레이션 SQL 작성 및 실행
  - **(1) 목표 및 내용:** `ARCHITECTURE.md` 섹션 3의 DDL을 바탕으로 `students`, `academic_terms`, `course_grades`, `test_scores`, `student_clubs`, `student_awards`, `counseling_logs`, `target_universities` 8개 테이블 및 인덱스, RLS 정책을 담은 마이그레이션 파일 작성.
  - **(2) 대상 파일:** `supabase/migrations/001_init_schema.sql`
  - **(3) 완료 조건:** Supabase 대시보드 또는 CLI를 통해 마이그레이션 적용 시 에러 없이 8개 테이블과 RLS가 활성화됨.

- [x] [TASK-202] Supabase 클라이언트 및 미들웨어 세션 보호 설정
  - **(1) 목표 및 내용:** Browser Client, Server Client, 그리고 `src/middleware.ts`를 구현하여 비인증 사용자의 포탈 접근을 차단하고 `/login`으로 리다이렉트 처리.
  - **(2) 대상 파일:** `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/middleware.ts`
  - **(3) 완료 조건:** 로그인되지 않은 상태에서 `/` 접근 시 `/login`으로 즉시 이동함.

- [x] [TASK-203] 교사 전용 로그인 페이지 및 Server Action 구현
  - **(1) 목표 및 내용:** 미니멀한 노션 스타일의 `/login` 페이지 작성 및 Supabase `signInWithPassword` 연동 서버 액션 구현.
  - **(2) 대상 파일:** `src/app/(auth)/login/page.tsx`, `src/lib/actions/auth.actions.ts`
  - **(3) 완료 조건:** 교사 계정으로 로그인 성공 시 포탈 메인(`/`)으로 정상 진입함.

---

## Phase 3: 핵심 도메인 기능 구현 (P0 Requirements)
- [x] [TASK-301] 학생 기본정보 관리 및 좌측 사이드바 학생 네비게이션 구현
  - **(1) 목표 및 내용:** 좌측 사이드바에 학년별(9~12) 필터 및 검색 기능이 포함된 학생 목록 컴포넌트 구현, 학생 선택 시 `/students/[studentId]`로 라우팅.
  - **(2) 대상 파일:** `src/app/(portal)/layout.tsx`, `src/components/shared/student-sidebar.tsx`, `src/lib/actions/student.actions.ts`
  - **(3) 완료 조건:** 사이드바에서 학생 클릭 시 해당 학생의 ID가 URL 파라미터에 반영됨.

- [x] [TASK-302] Gradelink Transcript PDF 파싱 엔진 구현 (`SKILL-01`)
  - **(1) 목표 및 내용:** `unpdf`를 활용하여 PDF 바이너리에서 학기별 수강 과목, 학점, 등급, GPA를 추출하는 순수 파서 함수 작성.
  - **(2) 대상 파일:** `src/lib/pdf-parser/extractor.ts`, `src/lib/pdf-parser/gradelink-parser.ts`, `src/app/api/transcript/parse/route.ts`
  - **(3) 완료 조건:** 테스트용 Gradelink PDF 업로드 시 과목, 학점, GPA가 담긴 `TranscriptPreviewDTO` JSON이 정상 반환됨.

- [x] [TASK-303] Transcript 일괄 업로드 및 2단계 검증 UI 구현
  - **(1) 목표 및 내용:** 다중 PDF 드래그앤드롭 업로드 센터, 파싱 미리보기 검증 테이블, 데이터베이스 Upsert Server Action 구현.
  - **(2) 대상 파일:** `src/app/(portal)/transcript-upload/page.tsx`, `src/components/transcript/transcript-preview-table.tsx`, `src/lib/actions/transcript.actions.ts`
  - **(3) 완료 조건:** PDF 업로드 후 미리보기를 거쳐 교사가 승인하면 `academic_terms`와 `course_grades`에 데이터가 정상 적재됨.

- [x] [TASK-304] Credit Make-up 수동 수정 및 GPA 재계산 엔진 구현 (`SKILL-02`)
  - **(1) 목표 및 내용:** 과목별 Credit Make-up 수정 모달, 이전 등급 백업, `is_credit_makeup = true` 태깅 및 학기/누적 GPA 재계산 로직 작성. 일괄 업로드 시 수동 수정본 보호 알고리즘 적용.
  - **(2) 대상 파일:** `src/lib/pdf-parser/gpa-calculator.ts`, `src/components/transcript/credit-makeup-modal.tsx`, `src/lib/actions/transcript.actions.ts`
  - **(3) 흐름 검증:** 성적 수정 시 누적 GPA가 즉시 재계산되고, PDF 재업로드 시 수동 수정 과목이 덮어씌워지지 않음.

- [x] [TASK-305] 공인시험(TOEFL/SAT/AP), 클럽, 상장 수동 장문 입력 폼 구현 (`SKILL-05`)
  - **(1) 목표 및 내용:** TOEFL, SAT/PSAT, AP 점수, 학생 클럽 리스트, 교내외 상장 데이터를 길고 상세하게 입력·수정할 수 있는 UI 및 Zod 검증 액션 구현.
  - **(2) 대상 파일:** `src/app/(portal)/students/[studentId]/records/page.tsx`, `src/components/records/test-score-form.tsx`, `src/components/records/club-award-form.tsx`, `src/lib/actions/records.actions.ts`
  - **(3) 완료 조건:** 각 항목별로 장문 메모와 점수가 정상적으로 `INSERT`/`UPDATE`됨.

- [x] [TASK-306] 1:1 학생 통합 대시보드 위젯 그리드 구현 (`SKILL-04`)
  - **(1) 목표 및 내용:** Recharts를 활용한 학기별 GPA 꺾은선 차트, 공인시험 요약 카드, 클럽/상장 리스트를 1280px 데스크톱 그리드에 배치. 12학년 이하 결측치 대응용 `<EmptyStateCard />` 적용.
  - **(2) 대상 파일:** `src/app/(portal)/students/[studentId]/page.tsx`, `src/components/dashboard/gpa-trend-chart.tsx`, `src/components/dashboard/test-summary-grid.tsx`, `src/components/shared/empty-state-card.tsx`
  - **(3) 완료 조건:** 데이터가 없는 저학년 학생 선택 시 에러 없이 깔끔한 빈칸 카드와 입력 유도 버튼이 렌더링됨.

- [x] [TASK-307] 1:1 진학상담 기록 및 타임라인 보드 구현
  - **(1) 목표 및 내용:** 상담 일자, 주제, 장문 상담 일지, 과제(Action Items), 중요 상담 핀(Pin) 고정 기능이 포함된 진학상담 탭 구현.
  - **(2) 대상 파일:** `src/app/(portal)/students/[studentId]/counseling/page.tsx`, `src/components/counseling/counseling-editor.tsx`, `src/lib/actions/counseling.actions.ts`
  - **(3) 완료 조건:** 상담 일지 작성 및 상단 핀 고정 토글이 실시간 반영됨.

- [x] [TASK-308] 목표 대학교 리스트 및 장단점(Pros/Cons) 비교 보드 구현
  - **(1) 목표 및 내용:** 교사 제안(`TEACHER`) vs 학생 희망(`STUDENT`) 태그, 대학별 장점, 단점, 전략 메모를 3단 칼럼으로 기록하고 비교하는 관리 탭 구현.
  - **(2) 대상 파일:** `src/app/(portal)/students/[studentId]/universities/page.tsx`, `src/components/universities/university-comparison-board.tsx`, `src/lib/actions/university.actions.ts`
  - **(3) 완료 조건:** 제안 주체별로 대학교 카드가 구분되어 등록되며 장단점 비교가 직관적으로 시각화됨.

---

## Phase 4: 예외 처리, 로딩/에러 스켈레톤, 반응형 및 폴리싱
- [x] [TASK-401] 장문 에디터 자동저장(Autosave) 및 임시 백업 훅 구현 (`SKILL-05`)
  - **(1) 목표 및 내용:** `useAutosave` 훅을 생성하여 상담 일지 및 장문 입력창에 디바운스(`1500ms`) 자동저장 및 `localStorage` 초안 백업 적용, 상태 뱃지 표시.
  - **(2) 대상 파일:** `src/hooks/use-autosave.ts`, `src/components/shared/autosave-indicator.tsx`
  - **(3) 완료 조건:** 타이핑 중 우측 상단에 `✓ 저장됨` 인디케이터가 정상 작동함.

- [x] [TASK-402] 로딩 스켈레톤 및 에러 바운더리(Error Boundary) 구축
  - **(1) 목표 및 내용:** 대시보드 및 탭 전환 시 부드러운 전환을 위한 `loading.tsx`, `error.tsx` 파일 작성 및 Server Action 에러 토스트 피드백 연결.
  - **(2) 대상 파일:** `src/app/(portal)/students/[studentId]/loading.tsx`, `src/app/(portal)/students/[studentId]/error.tsx`
  - **(3) 완료 조건:** 데이터 페칭 지연 시 스켈레톤 UI가 노출되며 서버 에러 시 사용자 친화적 메시지가 표시됨.

- [x] [TASK-403] 반응형 레이아웃 및 웹 접근성(WCAG AA) 최종 점검
  - **(1) 목표 및 내용:** 태블릿 및 데스크톱 환경에서의 레이아웃 깨짐 점검, 터치 영역(`44px+`) 확보, 포커스 링(`focus-visible:ring-2`) 전역 적용 확인.
  - **(2) 대상 파일:** `src/app/globals.css`, 주요 레이아웃 컴포넌트
  - **(3) 완료 조건:** 키보드 Tab 이동 시 모든 버튼과 입력창에 명확한 포커스 링이 노출됨.

- [x] [TASK-404] 최종 빌드 검증 및 프로젝트 문서 동기화 (`SKILL-06`)
  - **(1) 목표 및 내용:** `pnpm build` 및 `pnpm tsc --noEmit` 실행을 통해 타입 에러 `0건` 확인 후 `MEMORY.md`에 최종 아키텍처 의사결정 요약 기록.
  - **(2) 대상 파일:** `MEMORY.md`, `TASKS.md`
  - **(3) 완료 조건:** 프로덕션 빌드가 에러 없이 성공적으로 완료됨.