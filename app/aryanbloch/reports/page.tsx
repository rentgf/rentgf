'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Report = {
  id: string
  category: string | null
  description: string | null
  status: string | null
  created_at: string | null
  reporter_name: string | null
  reported_name: string | null
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const supabase = createClient()
    // `reports` has no `reason`/`reporter_profile_id`/`reported_profile_id` columns.
    // The real columns are `category`, `reporter_id`, and `reported_user_id`.
    const { data } = await supabase
      .from('reports')
      .select('id, category, description, status, created_at, reporter:profiles!reporter_id(display_name), reported:profiles!reported_user_id(display_name)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) {
      setReports(data.map((r) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reporter = r.reporter as any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const reported = r.reported as any
        return {
          id: r.id,
          category: r.category,
          description: r.description,
          status: r.status,
          created_at: r.created_at,
          reporter_name: reporter?.display_name ?? null,
          reported_name: reported?.display_name ?? null,
        }
      }))
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function resolve(reportId: string) {
    const supabase = createClient()
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: 'resolved' } : r))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Reports</h1>
      <p className="mt-1 text-sm text-[#68756e]">User safety reports requiring review.</p>

      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-[#68756e]">Loading…</p>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-[#e9e2d9] bg-white p-8 text-center">
            <CheckCircle2 className="mx-auto size-8 text-[#4e8068]" />
            <p className="mt-3 font-semibold">No reports</p>
            <p className="mt-1 text-sm text-[#68756e]">No safety reports have been filed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className={`rounded-2xl border bg-white p-4 ${ report.status === 'resolved' ? 'border-[#cfe2d3]' : 'border-[#f0d9ca]' }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 size-4 shrink-0 ${ report.status === 'resolved' ? 'text-[#4e8068]' : 'text-[#c36d4d]' }`} />
                    <div>
                      <p className="font-semibold text-sm">
                        {report.reporter_name ?? 'Unknown'} reported {report.reported_name ?? 'Unknown'}
                      </p>
                      <p className="mt-0.5 text-xs text-[#738078]">{report.category}</p>
                      {report.description && (
                        <p className="mt-2 text-sm text-[#52645b]">{report.description}</p>
                      )}
                      <p className="mt-2 text-xs text-[#9aa49d]">{report.created_at ? new Date(report.created_at).toLocaleString() : ''}</p>
                    </div>
                  </div>
                  {report.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => resolve(report.id)}
                      className="shrink-0 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068]"
                    >
                      Mark resolved
                    </button>
                  )}
                  {report.status === 'resolved' && (
                    <span className="shrink-0 rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#4e8068]">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
