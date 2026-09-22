'use client'

import { ShieldCheck } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#173f35]">Settings</h1>
      <p className="mt-1 text-sm text-[#68756e]">Admin panel configuration.</p>

      <div className="mt-6 rounded-2xl border border-[#e9e2d9] bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#edf4ed]">
            <ShieldCheck className="size-4 text-[#4e8068]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#173f35]">Admin access</p>
            <p className="text-sm text-[#68756e]">The admin panel password is managed via the <code className="font-mono">ADMIN_PASSWORD</code> environment variable in your hosting provider settings.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
