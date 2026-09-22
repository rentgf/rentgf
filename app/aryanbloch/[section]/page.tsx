import Link from 'next/link'
import { ArrowLeft, CheckCircle2, LockKeyhole } from 'lucide-react'

const titles: Record<string, { title: string; description: string }> = {
  users: { title: 'Users', description: 'Review customer accounts and account status.' },
  verification: { title: 'Verification', description: 'Review pending identity checks privately.' },
  payments: { title: 'Payments', description: 'Review payment records and provider status.' },
  payouts: { title: 'Payouts', description: 'Manage payout eligibility and processing.' },
  reviews: { title: 'Reviews', description: 'Moderate reviews after completed bookings.' },
  settings: { title: 'Platform settings', description: 'Configure fees, policies, and connected services.' },
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  const content = titles[section] ?? { title: 'Admin section', description: 'This section is ready for connected records.' }
  return <main className="min-h-screen bg-[#f5f7f3] px-4 py-6 text-[#173f35] sm:px-6"><div className="mx-auto max-w-4xl"><Link href="/aryanbloch" className="inline-flex items-center gap-2 text-sm text-[#68756e]"><ArrowLeft className="size-4" /> Back to admin</Link><div className="mt-12"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Admin workspace</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.06em]">{content.title}</h1><p className="mt-3 text-[#68756e]">{content.description}</p></div><section className="mt-8 rounded-3xl border border-[#e5ebe5] bg-white p-6 sm:p-8"><div className="flex items-start gap-4"><div className="flex size-11 items-center justify-center rounded-2xl bg-[#edf4ed]"><LockKeyhole className="size-5 text-[#315f50]" /></div><div><h2 className="font-semibold">Connected data required</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#68756e]">This workspace is ready for production records. Connect authentication and a database before viewing or changing real {content.title.toLowerCase()}.</p></div></div><div className="mt-6 rounded-2xl bg-[#f8fbf7] p-4 text-sm text-[#52665a]"><CheckCircle2 className="mr-2 inline size-4 text-[#4e8068]" />Server-side permissions and audit logging are required for every administrative action.</div></section></div></main>
}
