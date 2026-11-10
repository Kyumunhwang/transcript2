# ARCHITECTURE.md - 등대교육공동체 진학상담포탈 시스템 아키텍처 명세서

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Reference Document:** `PRD.md` (v1.0.0)  
> **Architecture Pattern:** Modular Feature-Sliced Next.js (App Router) + Supabase BaaS + Hybrid PDF Parsing Pipeline  

---

## 1. Tech Stack & Versions

AI 코딩 에이전트(Antigravity)는 패키지 설치 및 코드 생성 시 아래 명시된 버전을 엄격히 준수해야 한다. 임의로 구버전 문법(예: Pages Router, React 17 방식, Tailwind v3 설정 등)을 혼용해서는 안 된다.

### 1.1 Core Runtime & Full-Stack Framework
| 구분 | 기술 / 라이브러리 | 버전 기준 | 선정 이유 및 아키텍처 역할 |
| :--- | :--- | :--- | :--- |
| **Runtime** | **Node.js** | `>= 20.18.0 LTS` | 안정적인 서버 사이드 PDF 버퍼 처리 및 최신 Web API 지원 |
| **Package Manager** | **pnpm** | `^9.12.0` | 엄격한 의존성 관리 및 빠른 패키지 설치 |
| **Framework** | **Next.js (App Router)** | `^15.1.0` | React Server Components(RSC) 및 Server Actions 기반 풀스택 아키텍처 |
| **Language** | **TypeScript** | `^5.6.0` | Strict Mode 필수 활성화, DB 스키마-클라이언트 간 End-to-End 타입 안전성 보장 |
| **UI Library** | **React** | `^19.0.0` | `useActionState`, `useOptimistic` 등 최신 비동기 폼 상태 훅 활용 |

### 1.2 Backend, Database & PDF Engine
| 구분 | 기술 / 라이브러리 | 버전 기준 | 선정 이유 및 아키텍처 역할 |
| :--- | :--- | :--- | :--- |
| **Database & Auth** | **Supabase (PostgreSQL 15+)** | `@supabase/supabase-js ^2.46.0` | 관계형 학적/상담 데이터 영구 보관, RLS 보안 및 원본 PDF Storage 제공 |
| **SSR Auth Helper** | **@supabase/ssr** | `^0.5.2` | Next.js App Router 쿠키 기반 세션 동기화 및 미들웨어 라우트 보호 |
| **PDF Text Extractor** | **unpdf** (또는 `pdfjs-dist`) | `^0.12.0` (`^4.8.0`) | 서버리스/Node.js 환경에서 네이티브 바이너리 충돌 없이 Gradelink PDF 텍스트 추출 |
| **AI Fallback Parser** | **@google/genai** (선택적 보조) | `^0.1.2` | 정규식(Regex) 파싱이 모호한 비정형 Gradelink 레이아웃 발생 시 JSON 구조화 추출 보조 |

### 1.3 State Management, Validation & UI Styling
| 구분 | 기술 / 라이브러리 | 버전 기준 | 선정 이유 및 아키텍처 역할 |
| :--- | :--- | :--- | :--- |
| **Server State** | **TanStack Query v5** | `@tanstack/react-query ^5.60.0` | 학생 전환 시 1초 이내 즉시 렌더링을 위한 캐싱, 프리페칭 및 낙관적 업데이트 |
| **Client State** | **Zustand** | `^5.0.1` | 현재 선택된 학생 ID, 활성 탭, PDF 일괄 업로드 진행 큐 등 전역 UI 상태 관리 |
| **Form & Validation** | **React Hook Form + Zod** | `^7.53.0` / `^3.23.8` | Credit Make-up 성적 수정, 장문 상담 일지, 공인시험 입력 폼의 런타임/정적 검증 |
| **Styling** | **Tailwind CSS** | `^3.4.15` | 고밀도(High-density) 대시보드 그리드 레이아웃 및 반응형 스타일링 |
| **UI Components** | **shadcn/ui (Radix UI)** | `latest` | 접근성이 보장된 Modal, Tabs, Table, Combobox, Toast 컴포넌트 시스템 |
| **Charts & Icons** | **Recharts / Lucide React** | `^2.13.0` / `^0.460.0` | 학기별 GPA 추이 꺾은선/막대 차트 시각화 및 직관적인 상태 아이콘 제공 |
| **Deployment** | **Vercel** (또는 사내 Docker) | Production | Next.js 최적화 배포 및 Supabase 클라우드 연동 |

---

## 2. Directory Structure

프로젝트는 **도메인 기능 응집도(Feature Colocation)**와 **관심사 분리(Separation of Concerns)**를 동시에 달성하기 위해 아래와 같은 디렉토리 구조를 따른다.

```text
lighthouse-counseling-portal/
├── PRD.md                              # 제품 요구사항 정의서 (Single Source of Truth)
├── ARCHITECTURE.md                     # 시스템 아키텍처 명세서 (본 문서)
├── DESIGN.md                           # UI/UX 디자인 시스템 가이드 (P2)
├── TASKS.md                            # 구현 로드맵 및 태스크 체크리스트 (P2)
├── MEMORY.md                           # 에이전트 장기 기억 및 의사결정 로그 (P2)
├── Rules.md                            # Antigravity 코딩 규칙 (P2)
├── Skills.md                           # Antigravity 커스텀 스킬 명세 (P2)
├── supabase/
│   ├── migrations/                     # SQL 마이그레이션 파일 (001_init_schema.sql 등)
│   └── seed.sql                        # 등대교육공동체 초기 학생 샘플 데이터 시드
├── src/
│   ├── middleware.ts                   # Supabase 세션 갱신 및 비인가 사용자 라우트 차단
│   ├── app/                            # Next.js App Router 레이어 (라우팅 및 레이아웃 전용)
│   │   ├── layout.tsx                  # Root Layout (Providers, Pretendard 폰트, Toaster)
│   │   ├── globals.css                 # Tailwind 지시자 및 CSS 변수 정의
│   │   ├── (auth)/                     # 비인증 라우트 그룹
│   │   │   └── login/
│   │   │       └── page.tsx            # 진학담당교사 전용 로그인 페이지
│   │   ├── (portal)/                   # 인증 필수 라우트 그룹 (교사 전용 워크스페이스)
│   │   │   ├── layout.tsx              # GNB, 좌측 학생 검색 사이드바, 상단 탭 네비게이션쉘
│   │   │   ├── page.tsx                # 기본 진입점 (최근 상담 학생 또는 전체 학생 요약 뷰)
│   │   │   ├── students/
│   │   │   │   └── [studentId]/        # 특정 학생 1:1 상담 워크스페이스 (핵심 라우트)
│   │   │   │       ├── layout.tsx      # 학생 고정 프로필 헤더 + 4대 핵심 메뉴 탭 바
│   │   │   │       ├── page.tsx        # [Tab 1] 통합 Dashboard (GPA, 시험, 클럽, 상장 한눈에 보기)
│   │   │   │       ├── records/
│   │   │   │       │   └── page.tsx    # [Tab 2] 성적(Credit Make-up) 및 비교과 수동 상세 입력/수정
│   │   │   │       ├── counseling/
│   │   │   │       │   └── page.tsx    # [Tab 3] 1:1 진학상담 기록 보드 및 타임라인
│   │   │   │       └── universities/
│   │   │   │           └── page.tsx    # [Tab 4] 교사 제안 vs 학생 희망 대학 리스트 및 장단점 비교
│   │   │   └── transcript-upload/
│   │   │       └── page.tsx            # 학기 말 Gradelink Transcript PDF 일괄/개별 업로드 센터
│   │   └── api/
│   │       └── transcript/
│   │           └── parse/
│   │               └── route.ts        # 대용량/다중 PDF 파일 스트리밍 파싱 전용 Route Handler
│   ├── components/                     # 재사용 UI 컴포넌트 레이어
│   │   ├── ui/                         # shadcn/ui 원자 컴포넌트 (Button, Dialog, Tabs, Input 등)
│   │   ├── shared/                     # 공통 비즈니스 UI (EmptyStateCard, AutoResizeTextarea, SaveStatusBadge)
│   │   ├── dashboard/                  # [Tab 1] 대시보드 전용 위젯 (GpaTrendChart, TestSummaryGrid 등)
│   │   ├── transcript/                 # PDF 드래그앤드롭 업로더, 파싱 미리보기 검증 테이블, CreditMakeupModal
│   │   ├── records/                    # [Tab 2] TOEFL/SAT/AP, 클럽, 상장 장문 입력 폼 컴포넌트
│   │   ├── counseling/                 # [Tab 3] 상담 타임라인 리스트, 상담 에디터, 핀 고정 컴포넌트
│   │   └── universities/               # [Tab 4] 대학 제안 구분 뱃지, 장단점(Pros/Cons) 비교 카드/테이블
│   ├── lib/                            # 핵심 비즈니스 로직, 외부 연동, 서버 액션
│   │   ├── supabase/
│   │   │   ├── client.ts               # Browser Client (Client Component 용)
│   │   │   ├── server.ts               # Server Client (RSC, Server Actions, Route Handlers 용)
│   │   │   └── middleware.ts           # 세션 쿠키 리프레시 헬퍼
│   │   ├── pdf-parser/                 # Gradelink Transcript PDF 파싱 도메인 엔진 (핵심)
│   │   │   ├── extractor.ts            # PDF 바이너리 -> Raw Text / 줄 단위 토큰 추출
│   │   │   ├── gradelink-parser.ts     # 학기별 과목, 학점, 등급, Weighted/Unweighted GPA 정규식 파서
│   │   │   ├── gpa-calculator.ts       # Credit Make-up 수정 시 학기/누적 GPA 자동 재계산 순수 함수
│   │   │   └── validator.ts            # 파싱된 결과와 DB 학번 매칭 검증기
│   │   ├── actions/                    # Next.js Server Actions (데이터 변경 Mutation 전담)
│   │   │   ├── student.actions.ts      # 학생 기본정보 CRUD
│   │   │   ├── transcript.actions.ts   # 파싱 결과 DB 트랜잭션 반영 및 Credit Make-up 오버라이드
│   │   │   ├── records.actions.ts      # 공인시험, 클럽, 상장 수동 생성/수정/삭제
│   │   │   ├── counseling.actions.ts   # 1:1 상담 기록 저장 및 핀 고정 토글
│   │   │   └── university.actions.ts   # 목표 대학 추가 및 장단점/메모 업데이트
│   │   ├── validations/                # Zod 스키마 정의 (클라이언트 폼 & 서버 액션 공용 검증)
│   │   │   ├── transcript.schema.ts
│   │   │   ├── records.schema.ts
│   │   │   ├── counseling.schema.ts
│   │   │   └── university.schema.ts
│   │   └── utils.ts                    # 날짜 포맷터, GPA 소수점 포맷터(0.00), 클래스 병합(cn)
│   ├── hooks/                          # 커스텀 React Hooks
│   │   ├── queries/                    # TanStack Query 조회/변경 훅 (useStudentDashboard, useCounselingLogs)
│   │   ├── use-autosave.ts             # 장문 텍스트 입력 시 Debounce 기반 임시 저장/자동 저장 훅
│   │   └── use-pdf-batch.ts            # 학기 말 다중 PDF 순차/병렬 업로드 큐 제어 훅
│   ├── stores/                         # Zustand 클라이언트 전역 스토어
│   │   ├── use-portal-store.ts         # 사이드바 열림 상태, 학년 필터(9~12학년), 검색어 상태
│   │   └── use-upload-queue-store.ts   # 일괄 PDF 업로드 진행률 및 파싱 에러 리포트 상태
│   └── types/                          # 전역 TypeScript 타입 정의
│       ├── database.types.ts           # Supabase CLI 자동 생성 DB 스키마 타입 (절대 수동 수정 금지)
│       └── domain.types.ts             # 프론트엔드 도메인 확장 타입 및 PDF 파싱 DTO 타입