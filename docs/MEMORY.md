# MEMORY.md - 프로젝트 장기 기억 및 에이전트 히스토리 로그

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Reference Documents:** `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `SKILLS.md`, `TASKS.md`  
> **Purpose:** 개발 세션 간 컨텍스트 단절을 방지하고, 주요 아키텍처 변경 이력, 트러블슈팅 시행착오, 그리고 현재 프로젝트의 살아있는 진행 상태를 추적하는 Single Source of Truth.

---

## 1. Document Purpose & Update Rules (운영 지침)

AI 코딩 에이전트는 코드베이스에 중대한 변경을 가하거나 태스크를 완수할 때마다 본 문서(`MEMORY.md`)를 최신 상태로 유지해야 한다.

### 1.1 업데이트 타이밍 (When to Update)
1. **Task 완료 시점:** `TASKS.md`의 주요 체크리스트(특히 Phase 마일스톤)를 완료하고 빌드 검증을 마쳤을 때.
2. **아키텍처 및 스키마 변경 시 (ADR):** 초기 `PRD.md`나 `ARCHITECTURE.md`에 정의된 데이터 모델, API 구조, 기술 스택에 변경이 발생했을 때.
3. **난해한 버그 해결 시 (Lessons Learned):** 1시간 이상 소요된 빌드/런타임 에러, PDF 파싱 예외, Supabase RLS 충돌 등의 트러블슈팅이 완료되었을 때.

### 1.2 작성 규칙 (Writing Rules)
* **간결성과 명확성:** 장황한 설명보다 `[날짜] [Task-ID] 변경 내용 및 근본 원인` 형식의 구조화된 요약을 지향한다.
* **시간순 누적:** 가장 최근의 로그가 상단(Reverse Chronological Order)에 오도록 기록하거나, 각 섹션별로 타임스탬프를 명시한다.

---

## 2. Current Project Status (현재 프로젝트 상태)

* **Current Phase:** Phase 4 완료 (모든 MVP 및 P0/P1 요구사항 100% 구현 및 프로덕션 빌드 통과)
* **Last Completed Task:** `[TASK-404]` 최종 빌드 검증 및 프로젝트 문서 동기화 완료 (`SKILL-06`)
* **Next Task in Queue:** 전체 로드맵 완료 (Post-MVP P1 대학 매칭 엔진 고도화 대기)
* **Current Blockers / Open Issues:** 없음 (Next.js 15.5 프로덕션 빌드 및 타입 검사 100% 통과)

---

## 3. Architectural Decision Records (ADR - 아키텍처 변경 이력)

프로젝트 진행 중 초기 설계안에서 변경된 주요 기술적 의사결정을 기록한다.

| ADR ID & Date | 변경 항목 (What) | 변경 사유 및 배경 (Why) | 영향 받는 컴포넌트 / 파일 |
| :--- | :--- | :--- | :--- |
| **ADR-004**<br>*(2026-11-10)* | Next.js 15 `"use server"` 파일 내 re-export 제거 | Next.js 15 컴파일러 규격상 `"use server"` 지시어가 포함된 파일에서는 오직 해당 파일 내에서 직접 정의된 `async function`만 export할 수 있으며, 타 모듈의 함수를 re-export(`export { x } from ...`)할 경우 빌드가 차단됨. | `src/lib/actions/transcript.actions.ts` |
| **ADR-003**<br>*(2026-11-10)* | Supabase 4인자 제네릭 정렬 및 `[_ in never]: never` 적용 | 최신 `@supabase/supabase-js 2.119`와 `@supabase/ssr 0.5.2` 간 제네릭 인자(4인자) 불일치로 인한 타입 증발(`never`) 및 PostgREST의 View 오인 버그 방지. | `src/lib/supabase/server.ts`, `client.ts`, `src/types/database.types.ts` |
| **ADR-002**<br>*(2026-11-10)* | `packageManager: pnpm@9.15.0` 고정 및 `@google/genai` 버전 `^0.2.0` 지정 | 1) `ARCHITECTURE.md`에 명시된 `pnpm ^9.12.0` 사양을 엄격 준수하고 pnpm v12의 빌드 스크립트 비대화형 차단 에러 방지.<br>2) npm 레지스트리 상 부재한 `@google/genai@0.1.2` 대신 유효한 0.x 시초 버전 `^0.2.0` 적용. | `package.json`, `pnpm-lock.yaml` |
| **ADR-001**<br>*(2026-03-31)* | PDF 파싱 엔진으로 `pdfjs-dist` 대신 **`unpdf`** 단일 패키지 채택 | 서버리스 및 Node.js 20+ 환경에서 네이티브 바이너리 의존성 충돌 없이 Gradelink PDF 텍스트 레이어를 안정적으로 추출하기 위함. | `src/lib/pdf-parser/extractor.ts` |

---

## 4. Bug Fixes & Lessons Learned (트러블슈팅 로그)

개발 중 발생한 치명적인 에러와 그 해결 방법을 기록하여 동일한 실수의 재발을 방지한다.

### 4.1 [TASK-101] `src/middleware.ts` 텍스트 다이어그램 구문 오류 해결
* **Date:** 2026-11-10
* **Task ID:** [TASK-101]
* **Symptom:** `pnpm tsc --noEmit` 실행 시 `src/middleware.ts` 내부의 ASCII 다이어그램으로 인해 `TS1005: ',' expected` 다수 발생.
* **Root Cause:** 아키텍처 설계 다이어그램이 주석 없이 TypeScript 파일 본문에 직접 삽입되어 파싱 실패.
* **Solution:** 다이어그램을 JSDoc 주석 블록으로 래핑하고 유효한 Next.js 15 미들웨어 함수 보일러플레이트로 교체하여 컴파일 에러 해결.

### 4.2 [TASK-101] pnpm v12 비대화형 빌드 차단 (`ERR_PNPM_IGNORED_BUILDS`)
* **Date:** 2026-11-10
* **Task ID:** [TASK-101]
* **Symptom:** `canvas` 네이티브 모듈 빌드 스크립트로 인해 CI/CLI 환경에서 `ERR_PNPM_IGNORED_BUILDS` 발생.
* **Solution:** `package.json`에 `ARCHITECTURE.md` 권장 버전인 `"packageManager": "pnpm@9.15.0"`을 명시하여 corepack이 pnpm 9 LTS로 실행되도록 고정.

### 4.3 [TASK-203] 불필요한 의존성 배제 및 Zod 순수 검증 패턴
* **Date:** 2026-11-10
* **Task ID:** [TASK-203]
* **Symptom:** 미설치된 외부 패키지(`@hookform/resolvers`) 도입 시도 및 `ActionResult`의 `data: void` 강제 충돌.
* **Solution:** `RULES.md 1.2`에 따라 외부 의존성을 임의 추가하지 않고, 폼 핸들러에서 `loginSchema.safeParse`로 직접 검증하여 `setError`를 매핑함. 또한 `ActionResult<T = void>`의 `data?: T`를 옵셔널로 조정하여 반환 데이터가 없는 Mutation 액션도 타입 안전하게 수용하도록 보완.

### 4.4 [TASK-303] @supabase/supabase-js 2.119 & @supabase/ssr 0.5 간 제네릭 인자(4인자) 불일치 해결
* **Date:** 2026-11-10
* **Task ID:** [TASK-303]
* **Symptom:** Supabase `.update()`, `.insert()`, `.upsert()` 호출 시 인자 타입이 `never`로 추론되며 컴파일 에러 발생.
* **Root Cause:** `@supabase/ssr`의 `createServerClient`는 구버전 3개 제네릭 시그니처(`SupabaseClient<Database, SchemaName, Schema>`)로 정의되어 있으나, 최신 `@supabase/supabase-js` 2.119는 `SchemaNameOrClientOptions`를 2번째 인자로 추가하면서 3번째 인자가 `SchemaName`이 되고 4번째 인자가 `Schema`가 됨. 결과적으로 `Database[Database['public']]`을 참조하여 `Schema`가 `never`로 소멸됨.
* **Solution:** `src/lib/supabase/server.ts`와 `client.ts`에 4인자 제네릭 `SupabaseClient<Database, 'public', 'public', Database['public']>` 형태의 `TypedServerClient` / `TypedBrowserClient`를 명시하고 단언하여 완벽한 E2E 타입 추론 복구.

### [Template Example]
* **Date:** YYYY-MM-DD
* **Task ID:** [TASK-XXX]
* **Error Message / Symptom:** 
  > (예: `TypeError: Cannot read properties of null (reading 'gradePoints')`)
* **Root Cause (근본 원인):** 
  * 12학년 이하 저학년 학생의 경우 학기 데이터(`academic_terms`)가 존재하지 않아 `null`을 반환했으나 컴포넌트에서 방어 코드 없이 옵셔널 체이닝을 누락함.
* **Solution (해결 방법):** 
  * `src/lib/utils.ts`에 `formatGpa()` 방어 유틸리티를 도입하고, UI 컴포넌트에 `<EmptyStateCard />` 분기 처리를 추가함.
* **Prevention Rule:** 
  * 향후 모든 저학년 대상 대시보드 위젯 컴포넌트는 반드시 `null | undefined` 데이터를 수용할 수 있는 `Null-Safe` 구조로 작성할 것 (`SKILL-04`).

---

## 5. Environment & Known Issues (환경 및 기술 부채)

### 5.1 필수 환경 변수 목록 (.env Keys)
실제 비밀값은 노출하지 않고 필요한 키 이름만 관리한다.
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=