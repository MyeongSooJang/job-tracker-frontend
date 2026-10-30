import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Companies from '@/pages/Companies'
import Applications from '@/pages/Applications'
import ApplicationDetail from '@/pages/ApplicationDetail'
import InterviewDetail from '@/pages/InterviewDetail'
import Schedules from '@/pages/Schedules'
import Reviews from '@/pages/Reviews'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        <Route path="/applications/:applicationId/interviews/:interviewId" element={<InterviewDetail />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/reviews" element={<Reviews />} />
      </Routes>
    </Layout>
  )
}
