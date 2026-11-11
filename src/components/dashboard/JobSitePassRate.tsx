import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { jobSiteLabel } from '@/lib/jobSite'
import { formatPassRate, sortByPassRate } from '@/lib/jobSiteStats'
import type { JobSiteStat } from '@/api/types'

interface Props {
  stats: JobSiteStat[]
}

export default function JobSitePassRate({ stats }: Props) {
  const rows = sortByPassRate(stats)

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-slate-700">사이트별 서류 합격률</CardTitle>
        <p className="text-xs text-slate-400">면접 일정이 잡힌 지원 건 ÷ 전체 지원 건</p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">지원 내역이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map(s => {
              const percent = Math.round(s.documentPassRate * 100)
              const label = s.jobSite ? jobSiteLabel(s.jobSite) : '미지정'
              return (
                <li key={s.jobSite ?? 'UNSET'}className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm">
                  <span className="truncate text-slate-700">{label}</span>
                  <div
                    role="meter"
                    aria-label={`${label} 서류 합격률`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-valuetext={`${s.applicationCount}건 중 ${s.documentPassedCount}건, ${percent}%`}
                    className="h-2 rounded-full bg-brand-100"
                  >
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="flex items-baseline tabular-nums">
                    <span className="w-11 text-right font-semibold text-slate-800">
                      {formatPassRate(s.documentPassRate)}
                    </span>
                    <span className="ml-2 w-14 text-xs text-slate-400">
                      {s.documentPassedCount}/{s.applicationCount}건
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
