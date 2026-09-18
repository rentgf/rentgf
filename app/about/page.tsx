import Link from 'next/link'
import { ShieldCheck, Star, Users } from 'lucide-react'

export const metadata = {
  title: 'About — RentGF',
  description: 'RentGF is a safe companionship marketplace connecting people for lawful, non-sexual social activities.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-lg font-semibold text-[#173f35]">rent<span className="text-[#d17b58]">gf</span></Link>

      <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em] text-[#173f35]">About RentGF</h1>
      <p className="mt-4 text-lg leading-8 text-[#68756e]">We are building a safe, verified platform for lawful companionship — connecting real people for real experiences.</p>

      <div className="mt-12 space-y-8 text-sm leading-7 text-[#3a4d42]">
        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">Our mission</h2>
          <p className="mt-3">Loneliness is a real and growing issue. RentGF exists to make genuine companionship accessible — whether you need someone to join you for dinner, a movie, a trip, or just good conversation. Every companion on our platform is verified, every interaction is governed by strict community standards, and every meeting happens in public.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">What we stand for</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Safety first', desc: 'Verified identities, public meetings, and a zero-tolerance policy for illegal activity.' },
              { icon: Star, title: 'Quality companions', desc: 'Every companion is reviewed and approved by our team before going live.' },
              { icon: Users, title: 'Real connections', desc: 'No bots, no fake profiles. Just real people looking for genuine social experiences.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-[#e9e2d9] bg-white p-5">
                <Icon className="size-5 text-[#4e8068]" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#68756e]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">Our policy</h2>
          <p className="mt-3">RentGF is strictly a <strong>non-sexual companionship platform.</strong> We do not permit, facilitate, or tolerate any form of sexual services. Any user found violating this policy is permanently banned and reported to authorities. Our platform operates fully within Indian law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">Become a companion</h2>
          <p className="mt-3">Are you outgoing, reliable, and interested in earning by spending time with interesting people? Apply to become a verified companion on RentGF. We review every application carefully.</p>
          <Link href="/register" className="mt-4 inline-flex rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white">Apply now</Link>
        </section>
      </div>

      <div className="mt-16 flex gap-6 text-sm text-[#68756e]">
        <Link href="/privacy-policy" className="hover:text-[#173f35]">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-[#173f35]">Terms of Service</Link>
        <Link href="/contact" className="hover:text-[#173f35]">Contact</Link>
      </div>
    </main>
  )
}
