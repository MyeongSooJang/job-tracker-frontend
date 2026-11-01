import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import RequireAuth from '@/components/auth/RequireAuth'
import Dashboard from '@/pages/Dashboard'
import Companies from '@/pages/Companies'
import Applications from '@/pages/Applications'
import ApplicationDetail from '@/pages/ApplicationDetail'
import InterviewDetail from '@/pages/InterviewDetail'
import Schedules from '@/pages/Schedules'
import Reviews from '@/pages/Reviews'
import MyPage from '@/pages/MyPage'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/applications/:applicationId/interviews/:interviewId" element={<InterviewDetail />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/mypage" element={<MyPage />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
