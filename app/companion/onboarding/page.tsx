'use client'

import { useState } from 'react'
import Link from 'next/link'

const steps = ['Basic information', 'Profile photo', 'City & languages', 'Interests', 'Categories', 'Bio & price', 'Availability', 'Verification', 'Review']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [saved, setSaved] = useState(false)
  const isReview = step === steps.length - 1
  const isVerification = step === steps.length - 2

  function continueStep() {
    setSaved(false)
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  function goToReview() {
    setSaved(false)
    setStep(steps.length - 1)
  }

  function saveReview() {
    setSaved(true)
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#173f35] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/companion" className="text-sm text-[#68756e]">← Back to studio</Link>
        <div className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-[#c36d4d]">Companion onboarding</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em]">Tell people what makes time with you special.</h1>
          <p className="mt-3 text-[#68756e]">Step {step + 1} of {steps.length} · Your progress is saved when production storage is connected.</p>
        </div>
        <div className="mt-8 flex gap-1" aria-label="Onboarding progress">
          {steps.map((item, index) => <div key={item} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-[#d17b58]' : 'bg-[#e5ebe5]'}`} />)}
        </div>
        <section className="mt-8 rounded-3xl border border-[#e9e2d9] bg-white p-6 sm:p-8" aria-live="polite">
          <h2 className="text-xl font-semibold">{steps[step]}</h2>
          <p className="mt-2 text-sm leading-6 text-[#68756e]">This step is ready for secure form and storage integration. Keep public details respectful and never include private identity documents here.</p>
          <label className="mt-6 block text-sm font-medium" htmlFor="step-notes">Notes for this step
            <textarea id="step-notes" value={notes[step] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [step]: event.target.value }))} className="mt-2 min-h-32 w-full rounded-xl border border-[#e5e1da] p-3 outline-none focus:ring-2 focus:ring-[#bdd2c7]" placeholder="Add the information you would like to include..." />
          </label>
          {saved && <p className="mt-4 rounded-xl bg-[#edf4ed] px-4 py-3 text-sm text-[#35634d]" role="status">Your review is ready. A production submission service will be connected before publishing.</p>}
          <div className="mt-6 flex justify-between gap-3">
            <button type="button" disabled={step === 0} onClick={() => { setSaved(false); setStep((current) => Math.max(0, current - 1)) }} className="rounded-full border border-[#dce5dd] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Back</button>
            <button type="button" onClick={isReview ? saveReview : isVerification ? goToReview : continueStep} className="rounded-full bg-[#173f35] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#245447] focus:outline-none focus:ring-2 focus:ring-[#d17b58] focus:ring-offset-2">{isReview ? 'Submit for verification' : isVerification ? 'Continue to review' : 'Continue'}</button>
          </div>
        </section>
      </div>
    </main>
  )
}
