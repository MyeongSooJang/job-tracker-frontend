export type ApplicationStatus =
  | 'RESUME_SUBMITTED'
  | 'INTERVIEW'
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

// 회사 목록/상세 응답. 후기가 없으면 averageRating은 null이다.
export interface CompanyWithStats extends Company {
  reviewCount: number
  averageRating: number | null
}

// 회사별 공개 후기. 작성자 식별 정보는 내려오지 않는다(익명).
export interface CompanyReview {
  id: number
  rating: number
  content: string
  position: string
  stage: ApplicationStatus
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

export interface InterviewQuestion {
  id: number
  question: string
  answer: string
  memo: string
}

export interface Interview {
  id: number
  round: number
  interviewDate: string
  location: string
  note: string
  score: number | null
  questions: InterviewQuestion[]
}

export interface Review {
  id: number
  application: Application
  content: string | null
  rating: number | null
  createdAt: string
  updatedAt: string
}

export interface Schedule {
  id: number
  application: Application
  title: string
  scheduledAt: string
  type: ScheduleType
  address: string
  note: string
}

// 요청 타입
export interface CreateCompanyRequest {
  name: string
  industry?: string
  website?: string
}

export interface CreateApplicationRequest {
  companyId: number
  position: string
  appliedDate: string
}

export interface UpdateStatusRequest {
  status: ApplicationStatus
}

export interface CreateInterviewRequest {
  round: number
  interviewDate: string
  location?: string
  note?: string
}

export interface CreateQuestionRequest {
  question: string
  answer?: string
  memo?: string
}

export interface WriteReviewRequest {
  content: string
  rating: number
}

export interface CreateScheduleRequest {
  applicationId: number
  title: string
  scheduledAt: string
  type: ScheduleType
  address: string
  note?: string
}

// 인증 / 마이페이지
export interface SignupRequest {
  email: string
  name: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  accessToken: string
}

export interface ResumeInfo {
  fileName: string
  sizeBytes: number
  updatedAt: string
}

export interface Profile {
  email: string
  name: string
  phone: string | null
  birthDate: string | null
  // 취업 준비 시작일(yyyy-MM-dd). 미입력이면 null
  jobSearchStartDate: string | null
  address: string | null
  githubUrl: string | null
  blogUrl: string | null
  portfolioUrl: string | null
  education: string | null
  career: string | null
  desiredJob: string | null
  introduction: string | null
  resume: ResumeInfo | null
}

export type ProfileRequest = Omit<Profile, 'email' | 'resume'>

// 학습 기록 (하루 1건, studyDate는 yyyy-MM-dd)
export interface StudyLog {
  id: number
  studyDate: string
  content: string
  studyMinutes: number
}

export interface StudyLogRequest {
  content: string
  studyMinutes: number
}

export interface DailyStudyMinutes {
  date: string
  minutes: number
}

export interface StudyStats {
  currentStreak: number
  monthWrittenDays: number
  last7Days: DailyStudyMinutes[]
}
