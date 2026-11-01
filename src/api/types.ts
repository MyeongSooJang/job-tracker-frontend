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
