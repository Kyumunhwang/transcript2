# PRD.md - 등대교육공동체 진학상담포탈 (College Counseling & Academic Tracker Portal)

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Domain:** EdTech / School College Counseling & Student Academic Record Management  
> **Primary User:** 진학담당교사 (College Counselor)  

---

## 1. Project Overview

* **프로젝트명:** 등대교육공동체 진학상담포탈 (Lighthouse College Counseling Portal)
* **개발 목적:** 등대교육공동체 소속 학생들의 대학 진학 지도를 위해, 진학담당교사가 학생과 1:1 상담을 진행할 때 필요한 모든 학업·비교과·상담·목표 대학 데이터를 단일 화면에서 통합 조회하고 기록·추적 관리할 수 있는 웹 포탈을 구축한다.
* **핵심 가치:**
  1. **통합 대시보드 (Single View):** Gradelink 성적표(Transcript PDF) 기반의 학기별 GPA 추이와 공인시험 점수(TOEFL, SAT/PSAT, AP), 학생 클럽 활동, 교내외 수상 내역을 한눈에 파악한다.
  2. **유연한 성적 업데이트:** 학기 말 Gradelink Transcript PDF 일괄 파싱 업데이트뿐만 아니라, 계절학기/재수강(Credit Make-up)을 통한 개별 교과 점수 및 GPA 수동 수정을 지원한다.
  3. **누적 상담 및 진학 로드맵 추적:** 1:1 진학상담 히스토리를 영구 보존하고, 교사 제안 대학과 학생 희망 대학 리스트의 장단점 및 전략 메모를 체계적으로 비교·관리한다.
* **데이터 특성 고려사항:** 등대교육공동체 전 학년(특히 9~12학년) 학생의 기본 정보가 입력되며, 12학년 이하 저학년 학생들의 경우 공인시험 점수나 일부 활동/성적 데이터가 아직 존재하지 않아 **빈칸(Null/Empty state)이 많을 수 있으므로**, UI와 데이터베이스는 결측치가 있어도 레이아웃 깨짐이나 연산 오류 없이 유연하게 동작해야 한다.

---

## 2. Core User Flows

### Flow 1: 학생 기본정보 및 Gradelink Transcript PDF 데이터 구축
1. **기본 정보 로드:** 등대교육공동체 학생들의 기본 인적사항(학번, 한글/영문 이름, 현재 학년, 입학일, 이메일 등)을 등록하거나 관리한다.
2. **Transcript PDF 파싱 (일괄/개별):**
   * 학기 종료 후, 진학담당교사가 Gradelink(`https://gradelink.com/`)에서 생성된 학생별 Transcript PDF 파일(단일 또는 다중 파일)을 업로드한다.
   * 파서(Parser)가 PDF에서 **학년/학기별 수강 과목명, 학점(Credits), 성적(Grade), 학기별 GPA 및 누적 GPA(Weighted / Unweighted)**를 자동 추출하여 DB에 매핑한다.
3. **Credit Make-up 수동 수정:**
   * 학생이 Credit Make-up을 이수한 경우, 교사가 특정 학기의 과목 성적을 수동으로 수정하거나 추가한다.
   * 수정 시 시스템은 Credit Make-up 이력을 표시하고, 학기별 및 누적 GPA를 재계산하거나 교사가 직접 GPA 값을 수동 오버라이드(Override)할 수 있도록 허용한다.

### Flow 2: 공인시험 및 비교과 활동 수동 상세 입력
1. 교사는 대시보드 또는 데이터 관리 창에서 다음 항목들을 수동으로 직접 길고 상세하게 입력·수정한다. (핵심 요약 필드 + 상세 서술형 메모 영역 결합)
   * **공인시험 점수:** TOEFL, SAT, PSAT, AP (시험 일자, 총점, 섹션별 상세 점수 및 서술형 비고)
   * **학생 클럽 리스트 (Extracurricular Clubs):** 클럽명, 활동 기간/학년, 직책(Role), 활동 시간 및 구체적인 역할/성과 상세 기술
   * **교내외 상장 (Awards & Honors):** 수상명, 구분(교내/교외), 수상 등급, 수여 기관, 수상 일자 및 상세 내역 기술

### Flow 3: 1:1 학생 대시보드 조회 및 진학상담 기록
1. **Dashboard 탭:** 좌측 또는 상단 학생 검색/선택 바에서 상담할 학생을 선택하면, 한 화면(One-Page Dashboard)에 다음 위젯이 렌더링된다.
   * 학생 프로필 요약 및 누적 GPA 뱃지
   * 학기별 GPA 추이 차트 및 과목별 성적 상세 (Credit Make-up 여부 표시)
   * 공인시험(TOEFL, SAT/PSAT, AP) 요약 및 상세 보기
   * 학생 클럽 리스트 및 교내외 수상 내역 카드
   * (데이터가 없는 저학년 항목은 깔끔한 Empty State와 `[+ 바로 입력]` 버튼으로 표시)
2. **1:1 진학상담 탭 (Counseling Logs):**
   * 메뉴 탭 전환을 통해 해당 학생과의 역대 1:1 상담 기록 리스트를 시간순으로 조회한다.
   * 상담 일자, 상담 주제, 상세 상담 내용(Rich Text/Markdown), 향후 Action Item(과제)을 작성하고 영구 보관한다.

### Flow 4: 목표 대학교 리스트 제안 및 비교 관리
1. **대학 진학 관리 탭 (Target Universities):**
   * 위 대시보드와 상담 내용을 바탕으로 **'교사가 제안하는 대학교(Teacher Recommended)'**와 **'학생이 원하는 대학교(Student Desired)'** 리스트를 구분하여 등록한다.
   * 각 대학교 카드/행마다 **학교의 장점(Pros), 단점(Cons), 그리고 전략적 메모할 점(Notes & Requirements)**을 상세히 기록하고 비교·추적한다.

### Flow 5: 에이전트 기반 프로젝트 문서화 및 관리 연계
* 개발 진행 및 유지보수 과정에서 다음 핵심 프로젝트 관리 문서들과 동기화하여 작업한다:
  * `DESIGN.md` (Design System & UI/UX Guide - 디자인 시스템 정의서)
  * `TASKS.md` (Implementation Roadmap & Backlog - 작업 분할 및 진행 관리표)
  * `MEMORY.md` (Project Long-Term Memory - 프로젝트 장기 기억 및 히스토리 로그)

---

## 3. Functional Requirements (MVP)

### P0 (필수 구현 - MVP Core)
서비스 작동에 반드시 필요한 핵심 기능으로, 최우선으로 구현되어야 한다.

#### P0-1. 학생 기본정보 관리 및 학년별 Empty State 대응
* 학생 기본 프로필(학번, 성명, 영문명, 학년[9~12학년], 상태) CRUD 기능.
* 12학년 이하 학생들의 미입력 데이터(시험 점수, 클럽, 수상, 일부 학기 성적 등)가 빈칸(`null`)일 때 에러 없이 '미등록(Not Entered)' 상태로 깔끔하게 표시되고 언제든 즉시 수동 입력 모달/폼을 열 수 있는 UI 제공.

#### P0-2. Gradelink Transcript PDF 파서 및 학기별 GPA 관리
* **PDF 업로드 및 추출:** Gradelink 포맷의 Transcript PDF(개별 또는 다중 파일 일괄 업로드)를 읽어 학기(Term/Semester)별 수강 과목, 학점(Credits), 등급(Letter Grade), 학기별 GPA 및 누적 GPA를 추출하여 저장.
* **일괄 업데이트(Batch Update):** 학기 종료 시 다수의 성적표 PDF를 한 번에 업로드하여 기존 학생 데이터에 신규 학기 성적을 병합 업데이트.
* **Credit Make-up 수동 업데이트:** 특정 과목의 성적을 교사가 수동으로 수정(이전 성적 → 변경 성적 기록)하거나 학기 GPA를 수동 조정할 수 있는 편집 UI 제공.

#### P0-3. 공인시험·클럽·수상 내역 수동 장문 입력 기능
* **공인시험 (Standardized Tests):**
  * 카테고리: `TOEFL`, `SAT`, `PSAT`, `AP`
  * 입력 항목: 시험 종류, 응시일(또는 학년), 총점/등급, 세부 영역 점수 및 **길게 작성 가능한 상세 설명/메모 텍스트 필드**.
* **학생 클럽 리스트 (Clubs & Activities):**
  * 입력 항목: 클럽/활동명, 참여 학년/기간, 역할/직책, **구체적인 활동 내용 및 기여도를 길게 서술할 수 있는 텍스트 에디터 영역**.
* **교내외 상장 (Awards & Honors):**
  * 입력 항목: 상장/대회명, 교내(Internal)/교외(External) 구분, 수상 일자, 수여 기관, **수상 배경 및 상세 설명을 길게 기록할 수 있는 텍스트 영역**.

#### P0-4. 1:1 상담용 통합 Dashboard
* 선택한 학생의 **학기별 GPA 추이 + 과목 성적 + TOEFL/SAT(PSAT)/AP 점수 + 학생 클럽 리스트 + 교내외 상장**을 스크롤 최소화 및 직관적인 그리드 레이아웃으로 한눈에 보여주는 대시보드 화면.

#### P0-5. 메뉴 탭 기반 1:1 진학상담 기록 및 대학 리스트 관리
* **상단/측면 메뉴 탭 구조:**
  1. `대시보드 (Overview Dashboard)`
  2. `성적 및 이력 관리 (Transcript & Manual Inputs)`
  3. `1:1 진학상담 기록 (1:1 Counseling Logs)`
  4. `목표 대학 리스트 (University List & Pros/Cons)`
* **1:1 진학상담 지도 기능:** 상담 일자별 기록 생성, 조회, 수정, 삭제, 키워드 검색 및 중요 상담 핀(Pin) 고정 기능.
* **목표 대학교 리스트 기록 기능:**
  * 제안 주체 구분 태그: `교사 제안 (Teacher Suggested)` / `학생 희망 (Student Desired)` / `공통 합의 (Mutual)`
  * 기록 필드: 대학교명, 전공(선택), **장점(Pros - 서술형)**, **단점(Cons - 서술형)**, **메모할 점(Notes - 서술형)**.

---

### P1 (차순위 - Post-MVP Enhancement)
MVP 핵심 기능이 안정화된 이후 추가할 기능이다.

* **대학 Matching 기능 (University Matching Engine):**
  * 학생의 현재 누적 GPA, TOEFL, SAT/PSAT, AP 점수 및 비교과 프로필을 기반으로 지원 가능한 대학군(예: Reach / Match / Safety)을 자동 추천하거나, 목표 대학의 합격자 평균 스펙과 학생의 현재 스펙을 비교 분석해 주는 매칭 기능.

---

### P2 (차차순위 - Documentation & Agent Ecosystem)
시스템 아키텍처 고도화 및 Antigravity 에이전트 워크플로우 최적화를 위해 작성·유지되어야 하는 명세 문서군이다.

* `Architecture.md`: 전체 시스템 아키텍처, 데이터베이스 ERD, PDF 파싱 파이프라인 및 데이터 흐름도 정의서.
* `Rules.md`: Antigravity 코딩 에이전트가 코드 작성 시 준수해야 할 코딩 컨벤션, 에러 핸들링, 폴더 구조 및 보안 규칙.
* `Skills.md`: Antigravity 에이전트가 활용할 커스텀 스킬(예: Gradelink PDF 파싱 검증, DB 마이그레이션 등) 명세서.
* `DESIGN.md`: Design System & UI/UX Guide (컬러 팔레트, 타이포그래피, 대시보드 그리드 규격, 빈칸/결측치 표현 가이드).
* `TASKS.md`: Implementation Roadmap & Backlog (P0 → P1 → P2 단계별 세부 태스크 분할 및 진행 상태 추적표).
* `MEMORY.md`: Project Long-Term Memory (주요 기술적 의사결정, 스키마 변경 이력, 트러블슈팅 히스토리 로그).

---

## 4. Non-Functional Requirements

### 4.1 권장 기술 스택 (Antigravity 기본 구현 표준)
* **Frontend / Full-stack Framework:** Next.js (App Router, TypeScript), Tailwind CSS, shadcn/ui (또는 Lucide Icons)
* **Database & Storage:** Supabase (PostgreSQL) 또는 로컬 호환 관계형 DB (Prisma/Drizzle ORM 또는 Supabase Client 활용)
* **PDF Parsing Engine:** `pdf-parse` / `pdfjs-dist` (Node.js 환경) 또는 Python 기반 `pdfplumber` 마이크로서비스/스크립트 연동 (Gradelink Transcript 텍스트 레이어 정밀 정규식 추출)

### 4.2 핵심 데이터 스키마 요약 (Core Entities)
Antigravity는 아래 데이터 관계를 기준으로 테이블/모델을 설계한다. (모든 하위 테이블은 `student_id`를 외래키로 참조하며, 12학년 이하 학생을 위해 필수 키를 제외한 모든 점수/메모 필드는 `Nullable`로 설계한다.)
* `students`: `id`, `student_code`, `name_ko`, `name_en`, `grade_level` (9~12), `graduation_year`, `notes`, `created_at`
* `academic_terms`: `id`, `student_id`, `academic_year`, `semester`, `term_gpa_unweighted`, `term_gpa_weighted`, `cumulative_gpa`, `is_manual_override`, `source_pdf_name`
* `course_grades`: `id`, `term_id`, `student_id`, `course_name`, `credits`, `letter_grade`, `grade_points`, `is_credit_makeup` (Boolean), `original_grade` (Nullable), `makeup_note` (Nullable)
* `test_scores`: `id`, `student_id`, `test_type` (`TOEFL` | `SAT` | `PSAT` | `AP`), `test_date`, `total_score`, `section_scores_json`, `detailed_notes` (Text - 장문)
* `student_clubs`: `id`, `student_id`, `club_name`, `grade_levels`, `role`, `detailed_description` (Text - 장문)
* `student_awards`: `id`, `student_id`, `award_title`, `scope` (`INTERNAL` | `EXTERNAL`), `award_date`, `issuer`, `detailed_description` (Text - 장문)
* `counseling_logs`: `id`, `student_id`, `counselor_name`, `counseling_date`, `title`, `content` (Text - 장문), `action_items` (Text)
* `target_universities`: `id`, `student_id`, `university_name`, `major_interest`, `proposer_type` (`TEACHER` | `STUDENT` | `BOTH`), `pros` (Text - 장점), `cons` (Text - 단점), `notes` (Text - 메모할 점)

### 4.3 성능, 보안 및 UI/UX 요구사항
* **성능 (Performance):**
  * 학생 전환 시 대시보드 전체 데이터 로딩은 1초 이내에 완료되어야 한다.
  * 학기 말 Gradelink Transcript PDF 일괄 업로드 시 비동기 처리 및 진행률(Progress Bar) 표시를 통해 브라우저 프리징을 방지하고, 파싱 실패 항목에 대해서는 명확한 에러 리포트를 제공한다.
* **보안 (Security & Privacy):**
  * 학생의 성적 및 개인 상담 내용은 민감 정보이므로 승인된 진학담당교사만 접근할 수 있도록 인증(Authentication) 가드를 적용한다.
  * 수동 성적 수정(Credit Make-up) 및 PDF 일괄 업데이트 시 기존 데이터가 유실되지 않도록 변경 일시를 기록한다.
* **사용성 및 반응형 (Responsive & UX):**
  * 1:1 대면 상담 시 데스크톱 모니터 및 태블릿/노트북(1280px 이상 권장, 768px 이상 반응형 지원)에서 한눈에 정보가 들어오도록 고밀도(High-density) 카드 UI로 구성한다.
  * 장문 입력이 필요한 항목(시험 상세, 클럽 활동, 상장 내역, 상담 일지, 대학 장단점/메모)은 자동 높이 조절(Auto-expanding Textarea) 및 자동 저장/임시 저장 UX를 제공하여 상담 중 기록 유실을 방지한다.

---

## 5. Out of Scope (절대 구현 금지 항목)

AI 코딩 에이전트(Antigravity)는 개발 범위를 벗어나는 오버엔지니어링을 방지하기 위해, **사용자가 명시적으로 요청하지 않은 아래 기능들을 임의로 판단하여 절대 추가 개발해서는 안 된다.**

1. **요구사항 외 임의 기능 추가 전면 금지:** 위 `1~4번 항목`에 명시된 핵심 요구사항(Transcript PDF 기반 GPA 관리 및 Credit Make-up 수동 수정, TOEFL/SAT(PSAT)/AP/클럽/상장 수동 상세 기록, 통합 Dashboard, 1:1 진학상담 기록, 교사 제안/학생 희망 대학 리스트 및 장단점·메모 관리) 외의 부가 기능을 임의로 생성하지 않는다.
2. **학생 및 학부모 로그인 포털 구현 금지:** 본 시스템의 사용자는 오직 '진학담당교사'이다. 학생용 마이페이지, 학부모 열람용 계정, 권한 분리 가입 플로우 등을 임의로 개발하지 않는다.
3. **Gradelink 실시간 API 연동/크롤러 개발 금지:** Gradelink 시스템과 직접 API로 통신하거나 웹 스크래핑/크롤링 봇을 만들지 않는다. 오직 Gradelink에서 추출된 **Transcript PDF 파일을 읽어들여(Parsing) 처리하는 방식과 수동 입력 방식**만 구현한다.
4. **외부 원서 접수 시스템(Common App 등) 연동 및 메신저 기능 금지:** 실시간 채팅, 이메일/SMS 자동 발송, 학사 출결/급식/시간표 관리 등 진학상담 본연의 목적과 무관한 일반 학사 행정 모듈은 일절 포함하지 않는다.
5. **P0 완료 전 P1(대학 매칭) 선행 개발 금지:** P0(필수 구현) 기능이 100% 정상 작동하고 검증되기 전까지 P1 기능을 임의로 섞어서 먼저 구현하지 않는다.