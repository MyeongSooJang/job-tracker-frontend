import React from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { apiClient } from '@/lib/axios'
import './index.css'

const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
localStorage.setItem('job-tracker.accessToken', `${b64({ alg: 'none' })}.${b64({ sub: '1', exp: 4102444800 })}.x`)

const logs = [
  {
    id: 1,
    studyDate: '2026-11-09',
    title: 'Spring Security 필터 체인 정리',
    studyMinutes: 90,
    content: ['## 오늘 공부한 것', '', 'JwtAuthenticationFilter는 인증 필터 앞에 둔다.', '', '아래에 필터 체인 그림을 붙여넣었다.'].join('\n'),
  },
]

let uploads = 0
apiClient.defaults.adapter = async config => {
  const url = config.url ?? ''
  const method = (config.method ?? 'get').toLowerCase()
  const body = config.data && typeof config.data === 'string' ? JSON.parse(config.data) : {}
  let data: unknown = null
  let status = 200
  if (url.endsWith('/me/images')) {
    // 미리보기에서는 서버가 없으므로 올린 이미지 대신 번호가 붙은 그림을 돌려준다.
    uploads += 1
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200"><rect width="480" height="200" rx="12" fill="#dbeafe"/><text x="240" y="92" text-anchor="middle" font-size="26" font-family="sans-serif" fill="#1e3a8a">필터 체인 그림 ${uploads}</text><text x="240" y="132" text-anchor="middle" font-size="16" font-family="sans-serif" fill="#3b82f6">(mock 서버가 돌려준 이미지)</text></svg>`
    data = { url: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg) }
    status = 201
  } else if (url.endsWith('/heatmap')) data = []
  else if (url.endsWith('/stats')) data = { totalMinutes: 0, currentStreak: 0, longestStreak: 0, studyDays: 0 }
  else if (/\/study-logs\/\d+$/.test(url)) {
    const id = Number(url.split('/').pop())
    const log = logs.find(l => l.id === id)
    if (method === 'put' && log) Object.assign(log, body)
    if (method === 'delete') status = 204
    else data = log
  } else if (url.endsWith('/study-logs')) {
    if (method === 'post') {
      const created = { id: logs.length + 1, ...body }
      logs.push(created)
      data = created
      status = 201
    } else data = logs
  }
  return { data, status, statusText: 'OK', headers: {}, config }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/study-logs/1']}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
