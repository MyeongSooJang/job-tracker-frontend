# Job Tracker 프론트엔드 설계 문서

**작성일:** 2026-10-26
**작성자:** 장명수
**범위:** React 프론트엔드 (백엔드 API: job-tracker Spring Boot)

---

## 1. 프로젝트 개요

취업 활동 추적 웹 서비스의 프론트엔드.
백엔드(Spring Boot, `localhost:8080`)와 REST API로 연동하며, 회사 정보, 지원 현황, 면접 기록, 일정을 관리하는 UI를 제공한다.

별도 저장소(`job-tracker-frontend`)로 분리 관리.

---

## 2. 기술 스택

| 영역 | 선택 |
|---|---|
| 빌드 도구 | Vite |
| 프레임워크 | React 18 |
| 언어 | TypeScript |
| UI 컴포넌트 | shadcn/ui + Tailwind CSS |
| 서버 상태 관리 | TanStack Query (React Query v5) |
| 라우팅 | React Router v6 |
| HTTP 클라이언트 | Axios |
| 배포 | Vercel (무료) → 추후 사용자 증가 시 유료 전환 |

---

## 3. 페이지 구성 & 라우팅

| 경로 | 페이지 | 주요 기능 |
|---|---|---|
| `/` | 대시보드 | 전체 지원 현황 요약 카드, 최근 일정 목록 |
| `/companies` | 회사 목록 | 회사 등록 폼, 회사 목록 테이블 |
| `/applications` | 지원 목록 | 지원 건 등록, 목록 조회, 상태별 필터 |
| `/applications/:id` | 지원 상세 | 상태 전이 버튼, 면접 목록, 면접 등록 |
| `/applications/:id/interviews/:interviewId` | 면접 상세 | 질문/답변 추가, 질문 목록 |
| `/schedules` | 일정 | 일정 등록, 날짜별 목록 뷰 |

---

## 4. 백엔드 API 연동 커버리지

| Method | URL | 연동 페이지 |
|---|---|---|
| `POST` | `/api/companies` | 회사 목록 |
| `GET` | `/api/companies` | 회사 목록, 지원 등록 폼 |
| `POST` | `/api/applications` | 지원 목록 |
| `GET` | `/api/applications` | 지원 목록, 대시보드 |
| `GET` | `/api/applications/:id` | 지원 상세 |
| `PATCH` | `/api/applications/:id/status` | 지원 상세 |
| `POST` | `/api/applications/:id/interviews` | 지원 상세 |
| `GET` | `/api/applications/:id/interviews` | 지원 상세 |
| `POST` | `/api/applications/:id/interviews/:id/questions` | 면접 상세 |
| `GET` | `/api/applications/:id/interviews/:id/questions` | 면접 상세 |
| `POST` | `/api/schedules` | 일정 |
| `GET` | `/api/schedules` | 일정, 대시보드 |

---

## 5. 프로젝트 구조

```
job-tracker-frontend/
├── src/
│   ├── api/
│   │   ├── types.ts          ← 백엔드 도메인 TypeScript 타입
│   │   ├── companies.ts      ← 회사 API 함수
│   │   ├── applications.ts   ← 지원 API 함수
│   │   ├── interviews.ts     ← 면접 API 함수
│   │   └── schedules.ts      ← 일정 API 함수
│   ├── components/
│   │   ├── layout/           ← Header, Sidebar, Layout
│   │   └── ui/               ← shadcn/ui 컴포넌트 (자동 생성)
│   ├── hooks/
│   │   ├── useCompanies.ts
│   │   ├── useApplications.ts
│   │   ├── useInterviews.ts
│   │   └── useSchedules.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Companies.tsx
│   │   ├── Applications.tsx
│   │   ├── ApplicationDetail.tsx
│   │   ├── InterviewDetail.tsx
│   │   └── Schedules.tsx
│   ├── lib/
│   │   └── axios.ts          ← Axios 인스턴스 (baseURL 설정)
│   ├── App.tsx               ← 라우터 설정
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 6. TypeScript 타입 정의

```ts
// src/api/types.ts

export type ApplicationStatus =
  | 'RESUME_SUBMITTED'
  | 'RESUME_PASSED'
  | 'INTERVIEW_1'
  | 'INTERVIEW_2'
  | 'FINAL'
  | 'ACCEPTED'
  | 'REJECTED'

export type ScheduleType = 'INTERVIEW' | 'DOCUMENT_SUBMISSION' | 'TASK' | 'OTHER'

export interface Company {
  id: number
  name: string
  industry: string
  website: string
  createdAt: string
}

export interface Application {
  id: number
  company: Company
  position: string
  status: ApplicationStatus
  appliedDate: string
  createdAt: string
}

export interface Interview {
  id: number
  round: number
  interviewDate: string
  location: string
  note: string
  questions: InterviewQuestion[]
}

export interface InterviewQuestion {
  id: number
  question: string
  answer: string
  memo: string
}

export interface Schedule {
  id: number
  application: Application
  title: string
  scheduledAt: string
  type: ScheduleType
  note: string
}
```

---

## 7. 데이터 흐름

```
Page 컴포넌트
  └─ useXxx() 훅 (React Query)
       └─ api/xxx.ts (Axios)
            └─ Spring Boot API (localhost:8080)
```

- **서버 상태:** React Query가 캐싱, 로딩, 에러, 리패칭 자동 처리
- **UI 상태:** useState로 모달 열림/닫힘, 폼 입력값 관리
- **에러 처리:** API 실패 시 React Query `isError` 상태로 화면에 에러 메시지 표시

---

## 8. 배포 전략

| 단계 | 환경 | 방법 |
|---|---|---|
| 개발 | 로컬 | `vite dev` + 백엔드 `localhost:8080` |
| 초기 배포 | Vercel | GitHub 연동 자동 배포 |
| 확장 | Vercel Pro 또는 별도 서버 | 사용자 증가 시 전환 |

**CORS 설정:** 백엔드 Spring Boot에 Vercel 도메인 허용 설정 필요

---

## 9. 확장 계획 (Phase 2)

- JWT 로그인/회원가입 페이지 추가
- 다크 모드 지원
- 모바일 반응형 최적화
