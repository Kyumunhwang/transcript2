# RULES.md - Antigravity AI Coding Agent Engineering Rules & Guardrails

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Reference Documents:** `PRD.md` (v1.0.0), `ARCHITECTURE.md` (v1.0.0)  
> **Enforcement Level:** STRICT (절대 준수 / 위반 금지)

본 문서는 **등대교육공동체 진학상담포탈** 프로젝트의 코드 품질과 아키텍처 무결성을 유지하기 위한 절대 수칙이다. AI 코딩 에이전트(Antigravity)는 모든 코드 생성, 리팩토링, 디버깅 작업 시 본 문서의 지침을 최우선으로 준수해야 한다.

---

## 1. AI Behavioral Rules (AI 행동 수칙)

### 1.1 기존 코드 및 주석 보존 원칙
* **[DON'T]** 사용자가 명시적으로 수정을 요청하지 않은 기존 비즈니스 로직, 함수, 타입 정의, 주석을 임의로 삭제하거나 축약(`// ... existing code ...`)하여 유실시키지 마라.
* **[DON'T]** `PRD.md`의 **Out of Scope**에 명시된 기능(학생/학부모 로그인 뷰, Gradelink 실시간 크롤러, P0 완료 전 P1 대학 매칭 선행 구현 등)을 임의로 추측하여 코드에 끼워 넣지 마라.
* **[DO]** 기존 파일을 수정할 때는 변경 전후의 사이드 이펙트(Side Effect)를 먼저 검증하고, 특히 **Credit Make-up 수동 수정 보호 로직**과 **12학년 이하 학생의 결측치(Nullable) 방어 코드**가 훼손되지 않도록 보존하라.

### 1.2 패키지 및 의존성 통제 원칙
* **[DON'T]** `ARCHITECTURE.md`의 `1. Tech Stack & Versions`에 명시되지 않은 외부 npm 패키지를 사용자 승인 없이 임의로 `pnpm add` 하거나 `package.json`에 추가하지 마라.
* **[DO]** 새로운 라이브러리 도입이 불가피하다고 판단될 경우, 코드 작성 전에 **"도입 목적, 패키지명, 버전, 대안 비교"**를 사용자에게 먼저 제안하고 명시적 승인을 득한 후 설치하라.

### 1.3 파일 크기 제한 및 모듈 분리 원칙 (250-Line Hard Limit)
* **[DON'T]** 단일 파일의 코드 라인 수가 **250줄(Lines of Code)**을 초과하도록 방치하지 마라. (특히 `page.tsx`는 **150줄 이하**로 유지하라.)
* **[DO]** 파일 하나가 250줄을 넘어가거나 넘어갈 것으로 예상되면, 즉시 하위 컴포넌트, 커스텀 훅(`src/hooks/`), 또는 도메인 유틸리티(`src/lib/`)로 **모듈 분리를 먼저 제안하고 분할 작성**하라.

---

## 2. Naming Conventions (네이밍 규칙)

계층 간 혼선을 방지하기 위해 아래 표에 정의된 표기법을 예외 없이 적용하라.

| 대상 구분 | 표기법 (Case) | 규칙 및 작성 예시 |
| :--- | :--- | :--- |
| **디렉토리 (Folders)** | `kebab-case` | 소문자와 하이픈만 사용한다.<br>✅ `src/lib/pdf-parser`, `src/app/(portal)/transcript-upload`<br>❌ `src/lib/pdfParser`, `src/components/StudentClubs` |
| **컴포넌트 파일** | `kebab-case.tsx` | 파일명은 `kebab-case`로 통일하되, 내부 export 컴포넌트명은 `PascalCase`로 작성한다.<br>✅ 파일: `gpa-trend-chart.tsx` / 컴포넌트: `export function GpaTrendChart()` |
| **일반 TS 파일** | `kebab-case.ts` | 역할 접미사(`.actions.ts`, `.schema.ts`, `.types.ts`)를 명시한다.<br>✅ `transcript.actions.ts`, `records.schema.ts`, `use-autosave.ts` |
| **React 컴포넌트** | `PascalCase` | 명사구 형태로 명확한 도메인 역할을 드러낸다.<br>✅ `CreditMakeupModal`, `EmptyStateCard`, `TargetUniversityBoard` |
| **변수 및 일반 함수** | `camelCase` | 동사+명사 조합(함수) 및 명확한 명사구(변수)를 사용한다.<br>✅ `calculateWeightedGpa()`, `parsedTermList`, `studentId` |
| **Boolean 변수/Props** | `is/has/can/should` 접두사 | 긍정형 의문문 접두사를 강제한다.<br>✅ `isCreditMakeup`, `hasManualOverride`, `isPinned`<br>❌ `makeup`, `overrideFlag`, `notEmpty` |
| **Custom Hooks** | `use` + `camelCase` | 반드시 `use`로 시작한다.<br>✅ `useStudentDashboard`, `useAutosave`, `usePdfBatch` |
| **상수 및 환경변수** | `UPPER_SNAKE_CASE` | 하드코딩 방지용 고정 상수에 사용한다.<br>✅ `MAX_PDF_BATCH_SIZE`, `AUTOSAVE_DEBOUNCE_MS`, `GRADE_POINT_MAP` |
| **DB 테이블 & 컬럼** | `snake_case` | PostgreSQL 표준에 맞춰 소문자 스네이크 케이스만 사용한다.<br>✅ 테이블: `course_grades`, `counseling_logs` (복수형)<br>✅ 컬럼: `term_gpa_weighted`, `is_credit_makeup`, `student_id` |
| **TypeScript 타입/인터페이스** | `PascalCase` | `I` 또는 `T` 접두사(`IStudent`, `TScore`) 사용을 **금지**한다.<br>✅ `StudentProfile`, `TranscriptParseResult`, `CourseGradeInput` |

---

## 3. Language & Framework Specific Rules

### 3.1 TypeScript 엄격 규칙
* **[DON'T]** **`any` 타입 사용을 절대 금지한다.** (`as any`, `: any`, `Array<any>` 모두 금지)
  * 외부 입력이나 PDF 파싱 원본 데이터처럼 타입을 즉시 알 수 없는 경우 반드시 **`unknown`**으로 먼저 선언한 뒤, Zod 스키마(`.safeParse()`) 또는 사용자 정의 타입 가드(Type Guard)를 통과시켜 타입을 좁혀라(Narrowing).
* **[DON'T]** 비어있을 수 있는 12학년 이하 학생의 데이터에 Non-null assertion 연산자(`!`, 예: `student.cumulative_gpa_weighted!`)를 무분별하게 사용하지 마라.
* **[DO] `type` vs `interface` 사용 기준을 명확히 구분하라:**
  * **`interface`:** React 컴포넌트의 Props(`interface GpaCardProps`), 확장 가능한 도메인 엔티티 객체 구조에 사용한다.
  * **`type`:** 유니온 타입(`type TestType = 'TOEFL' | 'SAT' | 'PSAT' | 'AP'`), 교차 타입(Intersection), 유틸리티 변형 타입(`Omit`, `Pick`), Zod 추론 타입(`z.infer<typeof schema>`)에 사용한다.
* **[DO]** `src/types/database.types.ts`는 Supabase 스키마와 1:1 매핑되는 기준 파일이므로 수동으로 임의 변형하지 말고, 도메인 확장 타입은 반드시 `src/types/domain.types.ts`에서 정의하라.

### 3.2 Next.js 15 (App Router) & React 19 규칙
* **[DO] Server Component 기본 원칙 (RSC First):**
  * 모든 페이지(`page.tsx`)와 레이아웃(`layout.tsx`), 정적 데이터 표시용 컴포넌트는 기본적으로 **React Server Component(RSC)**로 작성하라.
  * Next.js 15 규격에 따라 동적 라우트 파라미터(`params`)와 `searchParams`는 반드시 비동기로 언래핑(`const { studentId } = await params;`)하여 사용하라.
* **[DON'T] `'use client'` 선언 남발 금지:**
  * 페이지 최상단이나 거대한 컨테이너 컴포넌트에 `'use client'`를 선언하지 마라.
  * `'use client'`는 오직 브라우저 이벤트 핸들러(`onClick`, `onChange`), React 상태/라이프사이클 훅(`useState`, `useEffect`), React Hook Form, Zustand, Recharts 차트 등 **클라이언트 상호작용이 필수적인 말단(Leaf) 컴포넌트**에만 최소 범위로 선언하라.
* **[DO] Server Actions 작성 표준 (`src/lib/actions/*.actions.ts`):**
  1. 파일 최상단에 반드시 `'use server';`를 선언하라.
  2. 모든 Server Action 함수의 첫 줄에서 `supabase.auth.getUser()`를 호출하여 **진학담당교사 인증 여부를 검증**하라. (`getSession()` 단독 사용 금지)
  3. 전달받은 인자는 반드시 `src/lib/validations/`에 정의된 **Zod 스키마로 `safeParse` 검증**을 수행하라.
  4. DB 변경(Mutation) 성공 후에는 관련 라우트 캐시를 갱신하기 위해 `revalidatePath('/students/[studentId]')`를 명시적으로 호출하라.
  5. 반환 타입은 예외를 그대로 던지지 말고 표준화된 응답 객체(`ActionResult<T>`)를 반환하라.

---

## 4. Error Handling & Logging (에러 처리 및 로깅 표준)

### 4.1 표준 응답 객체 및 Try-Catch 패턴
* **[DON'T]** 비동기 함수나 Server Action 내부에서 빈 `catch (e) {}` 블록으로 에러를 삼키거나(Swallowing), 날것의 DB 에러 스택(PostgreSQL 테이블 구조 노출 등)을 클라이언트에 그대로 반환하지 마라.
* **[DO]** 모든 Server Action과 PDF 파싱 엔진 함수는 아래와 같은 `ActionResult<T>` 패턴과 구조화된 `try-catch` 블록을 사용하라.

```typescript
export type ActionResult<T void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: { code: string; message: string; details?: Record<string, string[]> } };

export async function updateCourseGradeMakeup(input: unknown): Promise<ActionResult<{ number updatedGpa: }>> {
  try {
    // 1. 인증 검증 (Early Return)
    const user = await requireAuthenticatedCounselor();
    if (!user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: '진학담당교사 로그인이 필요합니다.' } };
    }

    // 2. 입력값 검증 (Early Return)
    const parsed = creditMakeupSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력된 성적 형식이 올바르지 않습니다.',
          details: parsed.error.flatten().fieldErrors,
        },
      };
    }

    // 3. 비즈니스 로직 및 트랜잭션 수행
    const result = await executeMakeupTransaction(parsed.data);
    return { success: true, data: result, message: 'Credit Make-up 성적이 반영되었습니다.' };
  } catch (err: unknown) {
    logServerError('updateCourseGradeMakeup', err, { input });
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '성적 업데이트 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }
}