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
  questions: InterviewQuestion[]
}

export interface Schedule {
  id: number
  application: Application
  title: string
  scheduledAt: string
  type: ScheduleType
  note: string
}

export interface Review {
  id: number
  application: Application
  content: string | null
  rating: number | null
  createdAt: string
  updatedAt: string
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
  note?: string
}
