export function PreviewBanner({ compact = false }: { compact?: boolean }) {
  return <div className={`flex items-start gap-3 rounded-2xl border border-[#f0d7b8] bg-[#fff8ed] text-[#795b37] ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}`}><span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#d17b58]" /><p><strong>Preview mode:</strong> data is stored only in this browser. No real payments or account changes are made.</p></div>
}
