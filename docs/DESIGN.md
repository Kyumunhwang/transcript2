# DESIGN.md - 등대교육공동체 진학상담포탈 디자인 시스템 및 UI/UX 가이드

> **Document Version:** 1.0.0  
> **Target Agent:** Antigravity AI Coding Agent  
> **Design Concept:** Notion-style Minimal & Clean (미니멀하고 깔끔한 노션 스타일, 고밀도 데이터 가독성 중심)  
> **Reference Documents:** `PRD.md`, `ARCHITECTURE.md`, `RULES.md`

---

## 1. Brand Identity & Mood

### 1.1 디자인 핵심 키워드 3가지
1. **Calm & Professional (차분하고 정돈된 신뢰감):** 불필요한 장식과 과도한 그래디언트를 배제하고, 화이트와 오프화이트 바탕 위에 세밀한 테두리와 절제된 컬러를 사용하여 교사가 장시간 업무를 보아도 눈이 편안한 환경을 제공한다.
2. **High-Density Readability (정보 밀도 높은 스캔성):** GPA, 공인시험, 클럽, 상장, 대학 리스트 등 방대한 학생 진학 데이터를 스크롤 최소화로 한눈에 파악할 수 있도록 컴팩트하고 정렬된 그리드 구조를 채택한다.
3. **Contextual Minimalism (문맥 중심의 미니멀리즘):** 노션(Notion)처럼 마우스 호버 시에만 나타나는 액션 버튼, 깔끔한 인라인 태그, 명확한 섹션 구분을 통해 인터페이스의 시각적 노이즈를 최소화한다.

### 1.2 UX 원칙
* **Zero-Friction Entry:** 12학년 이하 학생들의 결측치(Empty State)를 마주했을 때, 어색한 공백 대신 즉시 입력을 유도하는 산뜻한 `[+ 데이터 추가]` 액션 카드를 노출한다.
* **Instant Feedback & Autosave:** 장문 입력(상담 일지, 대학 장단점 등) 시 유실 방지를 위한 자동저장 상태 뱃지(`✓ 저장됨`)를 직관적으로 제공한다.

---

## 2. Color Palette (Tailwind CSS & CSS Variables)

노션 스타일의 따뜻한 오프화이트 배경(`Background`), 중성적인 회색 텍스트 계열(`Text`), 그리고 차분한 블루 액센트(`Accent`) 체계를 사용한다.

### 2.1 Background & Surface
| 토큰명 | HEX / HSL | Tailwind 클래스 | 용도 설명 |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#FAFAFA` (`hsl(0, 0%, 98%)`) | `bg-[#FAFAFA]` | 전체 앱 바탕 화면 (Canvas Background) |
| `--bg-surface` | `#FFFFFF` (`hsl(0, 0%, 100%)`) | `bg-white` | 카드, 모달, 드롭다운 등 컨테이너 표면 |
| `--bg-secondary` | `#F1F1F0` (`hsl(40, 6%, 94%)`) | `bg-[#F1F1F0]` | 사이드바, 테이블 헤더, 호버 배경 (Notion Gray Hover) |
| `--bg-elevated` | `#FFFFFF` (`hsl(0, 0%, 100%)`) | `bg-white shadow-md` | 팝오버, 플로팅 모달, 드롭다운 메뉴 |

### 2.2 Text Colors
| 토큰명 | HEX / HSL | Tailwind 클래스 | 용도 설명 |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#37352F` (`hsl(40, 9%, 21%)`) | `text-[#37352F]` | 본문 텍스트, 주요 제목 (Notion Dark Text) |
| `--text-secondary` | `#787774` (`hsl(40, 2%, 46%)`) | `text-[#787774]` | 부가 설명, 테이블 서브텍스트, 메타데이터 |
| `--text-muted` | `#9B9A97` (`hsl(40, 2%, 60%)`) | `text-[#9B9A97]` | 플레이스홀더, 비활성 라벨, 빈칸 안내 |
| `--text-inverted` | `#FFFFFF` (`hsl(0, 0%, 100%)`) | `text-white` | 버튼 내부 텍스트, 다크 뱃지 텍스트 |

### 2.3 Accent & Brand
| 토큰명 | HEX / HSL | Tailwind 클래스 | 용도 설명 |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#2383E2` (`hsl(209, 76%, 51%)`) | `bg-[#2383E2] text-white` | 주요 액션 버튼, 링크, 활성 탭  индикатор (Notion Blue) |
| `--accent-hover` | `#1A6FC4` (`hsl(209, 76%, 44%)`) | `hover:bg-[#1A6FC4]` | 액션 버튼 마우스 호버 상태 |
| `--accent-subtle` | `#E8F2FC` (`hsl(209, 76%, 95%)`) | `bg-[#E8F2FC] text-[#2383E2]` | 포커스 배경, 선택된 항목 하이라이트 뱃지 |

### 2.4 Semantic Colors
| 토큰명 | Light HEX | Light Tailwind | Dark/Subtle BG | 용도 설명 |
| :--- | :--- | :--- | :--- | :--- |
| `--success` | `#0F9D58` | `text-[#0F9D58]` | `bg-[#E6F4EA]` | GPA 우수, Credit Make-up 완료, 저장 성공 |
| `--warning` | `#F2994A` | `text-[#F2994A]` | `bg-[#FDF2E9]` | 주의 필요 항목, 미제출 서류 안내 |
| `--danger` | `#EB5757` | `text-[#EB5757]` | `bg-[#FCE8E6]` | 삭제 액션, 파싱 에러, 학점 미달 경고 |
| `--info` | `#2F80ED` | `text-[#2F80ED]` | `bg-[#E8F0FE]` | 교사 제안 대학 뱃지, 안내 메시지 |

---

## 3. Typography Scale

* **Font Family:** `Pretendard`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif

| 크기 명칭 | 폰트 사이즈 (`rem / px`) | 줄간격 (`line-height`) | 굵기 (`font-weight`) | 주요 사용처 |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | `1.5rem / 24px` | `1.3` | `600 (SemiBold)` | 포탈 메인 타이틀, 학생 상세 대시보드 성명 |
| **Heading 2** | `1.25rem / 20px` | `1.4` | `600 (SemiBold)` | 대시보드 위젯 타이틀, 섹션 제목 |
| **Heading 3** | `1.0rem / 16px` | `1.5` | `600 (SemiBold)` | 카드 타이틀, 모달 헤더 |
| **Heading 4** | `0.875rem / 14px` | `1.5` | `500 (Medium)` | 서브 테이블 헤더, 폼 레이블 |
| **Body Large** | `0.9375rem / 15px` | `1.6` | `400 (Regular)` | 주요 서술형 메모, 1:1 상담 일지 본문 |
| **Body Default**| `0.875rem / 14px` | `1.5` | `400 (Regular)` | 일반 테이블 데이터, 입력 폼 기본 텍스트 |
| **Caption / Meta**| `0.75rem / 12px` | `1.4` | `400 (Regular)` | 타임스탬프, PDF 파일명, 보조 뱃지 텍스트 |

---

## 4. Layout & Spacing System

### 4.1 기본 그리드 및 컨테이너
* **데스크톱 레이아웃:** 좌측 사이드바(고정 `260px` 또는 접이식) + 우측 메인 워크스페이스(유동형 그리드).
* **컨테이너 최대 너비 (`max-width`):** `1440px` (고밀도 대시보드 컴포넌트들이 양옆으로 여유롭게 배치되도록 설계).
* **그리드 간격 (Gap):** 표준 `16px` (`gap-4`) 또는 컴팩트 `12px` (`gap-3`).

### 4.2 Spacing Scale (Tailwind 기준)
* `px-1` (4px), `px-2` (8px), `px-3` (12px), `px-4` (16px), `px-6` (24px), `px-8` (32px)

### 4.3 모서리 곡률 (Border Radius)
노션 스타일의 깔끔한 스퀘어 감성을 위해 모서리를 과도하게 둥글게 처리하지 않는다.
* `rounded-sm` (`4px`): 태그, 뱃지, 인라인 버튼
* `rounded-md` (`6px`): 입력 폼(Input), 카드(Card), 드롭다운
* `rounded-lg` (`8px`): 모달 창, 대형 컨테이너

### 4.4 Box Shadow 단계
* `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.03)` (미세한 카드 외곽선 보완)
* `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)` (일반 카드 기본 그림자)
* `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.08)` (모달 및 플로팅 패널)

---

## 5. Core Component Guidelines

### 5.1 버튼 (Buttons)
* **Primary:** `bg-[#37352F] text-white hover:bg-[#2F2E2A] px-4 py-2 rounded-md text-sm font-medium transition-colors`
* **Secondary (Ghost):** `bg-transparent text-[#37352F] hover:bg-[#F1F1F0] px-3 py-1.5 rounded-md text-sm font-medium transition-colors`
* **Danger:** `bg-white text-[#EB5757] border border-[#EB5757]/30 hover:bg-[#FCE8E6] px-3 py-1.5 rounded-md text-sm font-medium`
* **States:**
  * *Disabled:* `opacity-50 cursor-not-allowed pointer-events-none`
  * *Loading:* 스피너 아이콘 노출 및 클릭 차단

### 5.2 입력 폼 (Inputs & Textareas)
* **Default:** `bg-white border border-[#E0E0DE] text-[#37352F] text-sm rounded-md px-3 py-2 placeholder:text-[#9B9A97] focus:outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] transition-all`
* **Error:** `border-[#EB5757] focus:border-[#EB5757] focus:ring-[#EB5757]`
* **Auto-expanding Textarea (장문 입력용):** 최소 높이 `120px` 이상 확보, 스크롤바 노출 최소화.

### 5.3 카드 (Cards - Dashboard Widgets)
* **Container:** `bg-white border border-[#E5E5E3] rounded-md p-5 shadow-xs hover:border-[#D1D1CE] transition-all`
* **Header:** 좌측 타이틀 (Heading 3) + 우측 액션 버튼 (`[+ 추가]` 또는 편집 아이콘) 배치.

### 5.4 모달 (Modals & Dialogs)
* **Backdrop:** `fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50 animate-fade-in`
* **Content Box:** `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-lg shadow-lg border border-[#E5E5E3] p-6 z-50`

### 5.5 네비게이션 바 & 탭 (Navbars & Tabs)
* **Sub-Tabs (학생 상세 워크스페이스 4대 탭):**
  * 활성 상태: `border-b-2 border-[#37352F] text-[#37352F] font-semibold`
  * 비활성 상태: `border-b-2 border-transparent text-[#787774] hover:text-[#37352F] font-normal`

---

## 6. Responsive & Accessibility

### 6.1 브레이크포인트 (Breakpoints)
* **Mobile (`< 768px`):** 모바일 레이아웃 최적화 (사이드바 숨김 및 햄버거 메뉴 전환).
* **Tablet (`768px ~ 1023px`):** 2단 그리드 압축 배치.
* **Desktop (`>= 1024px`, 권장 `1440px+`):** 좌측 사이드바 고정 및 우측 12컬럼 대시보드 풀렌더링.

### 6.2 터치 및 클릭 영역 (Touch Targets)
* 모든 버튼, 탭, 아이콘 링크의 최소 클릭 영역은 **`44px × 44px`** 이상을 보장하여 교사가 마우스 또는 태블릿 터치로 빠르게 조작할 수 있게 한다.

### 6.3 색상 명암비 및 접근성 (WCAG AA Compliance)
* 본문 텍스트 컬러(`--text-primary: #37352F`)와 바탕색(`--bg-surface: #FFFFFF`) 간의 명암비는 **`12.6:1`**로 웹 접근성 기준(WCAG AA 4.5:1 이상)을 충족한다.

### 6.4 키보드 포커스 링 (Focus Ring)
* 키보드 네비게이션(Tab 이동) 시 시각적 인지 강화를 위해 모든 인터랙티브 요소에 명확한 포커스 링을 강제한다:
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2383E2] focus-visible:ring-offset-1`