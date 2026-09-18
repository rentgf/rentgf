import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — RentGF',
  description: 'Terms and conditions for using the RentGF companionship platform.',
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-lg font-semibold text-[#173f35]">rent<span className="text-[#d17b58]">gf</span></Link>
      <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em] text-[#173f35]">Terms of Service</h1>
      <p className="mt-3 text-sm text-[#68756e]">Last updated: June 2025</p>

      <div className="mt-10 space-y-10 text-sm leading-7 text-[#3a4d42]">
        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">1. Acceptance of terms</h2>
          <p className="mt-3">By creating an account or using RentGF, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform. These terms apply to all users including customers and companions.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">2. Eligibility</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>You must be at least 18 years of age.</li>
            <li>You must provide accurate registration information.</li>
            <li>You must not have been previously banned from the platform.</li>
            <li>You must be legally allowed to use such services in your jurisdiction.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">3. Nature of service</h2>
          <p className="mt-3">RentGF is a platform for <strong>lawful, non-sexual social companionship only.</strong> This includes activities such as dining, coffee, movies, events, travel companionship, and conversation. The platform strictly prohibits:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Any sexual services or solicitation of sexual acts.</li>
            <li>Escort services of a sexual nature.</li>
            <li>Any illegal activity of any kind.</li>
            <li>Harassment, abuse, or threatening behaviour.</li>
          </ul>
          <p className="mt-3">Violations will result in immediate account termination and may be reported to law enforcement.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">4. User conduct</h2>
          <p className="mt-3">All users agree to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Treat all other users with respect and dignity.</li>
            <li>Meet only in safe, public locations.</li>
            <li>Not share personal contact information (phone, social media) until both parties feel safe.</li>
            <li>Report any violation of these terms to our support team.</li>
            <li>Not record, photograph, or share content of another user without explicit consent.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">5. Companion verification</h2>
          <p className="mt-3">All companions must complete our verification process including identity verification and age confirmation before their profile is made visible. RentGF reserves the right to reject or remove any companion profile at its sole discretion.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">6. Bookings and payments</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Booking requests are confirmed only after the companion accepts.</li>
            <li>Payment is collected after acceptance.</li>
            <li>A 15% platform fee applies to all bookings.</li>
            <li>Refunds are handled on a case-by-case basis. Contact support within 24 hours of a disputed booking.</li>
            <li>RentGF is not liable for any losses arising from cancelled or disputed bookings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">7. Intellectual property</h2>
          <p className="mt-3">All content on the platform including design, logos, and code is owned by RentGF. Users retain ownership of content they upload (photos, bio) but grant RentGF a non-exclusive license to display it on the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">8. Limitation of liability</h2>
          <p className="mt-3">RentGF is a technology platform connecting users. We are not responsible for the actions of users or companions. We do not guarantee the accuracy of profiles. To the maximum extent permitted by law, RentGF is not liable for any indirect, incidental, or consequential damages.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">9. Termination</h2>
          <p className="mt-3">We may suspend or terminate your account at any time for violations of these terms or at our discretion. You may delete your account at any time from your settings page.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">10. Governing law</h2>
          <p className="mt-3">These terms are governed by the laws of India. Any disputes shall be resolved in the courts of Delhi, India.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">11. Contact</h2>
          <p className="mt-3">For questions about these terms, contact us at <a href="mailto:legal@rentgf.com" className="text-[#c36d4d] underline">legal@rentgf.com</a>.</p>
        </section>
      </div>

      <div className="mt-16 flex gap-6 text-sm text-[#68756e]">
        <Link href="/privacy-policy" className="hover:text-[#173f35]">Privacy Policy</Link>
        <Link href="/contact" className="hover:text-[#173f35]">Contact</Link>
        <Link href="/" className="hover:text-[#173f35]">Home</Link>
      </div>
    </main>
  )
}
