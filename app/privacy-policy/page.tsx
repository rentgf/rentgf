import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — RentGF',
  description: 'How RentGF collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-lg font-semibold text-[#173f35]">rent<span className="text-[#d17b58]">gf</span></Link>
      <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em] text-[#173f35]">Privacy Policy</h1>
      <p className="mt-3 text-sm text-[#68756e]">Last updated: June 2025</p>

      <div className="mt-10 space-y-10 text-sm leading-7 text-[#3a4d42]">
        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">1. Who we are</h2>
          <p className="mt-3">RentGF operates a companionship marketplace that connects adults seeking lawful, non-sexual social companionship with verified companions. Our platform is available at rentgf.com. All services are strictly limited to platonic social activities.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">2. Information we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><strong>Account information:</strong> Your display name, email address, date of birth, and password when you register.</li>
            <li><strong>Profile information:</strong> Photos, bio, city, and preferences you choose to add.</li>
            <li><strong>Booking data:</strong> Dates, times, meeting locations, activity types, and amounts for bookings you create or receive.</li>
            <li><strong>Messages:</strong> Content of conversations between users and companions on our platform.</li>
            <li><strong>Device and usage data:</strong> IP address, browser type, pages visited, and interaction events for security and analytics.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">3. How we use your information</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To create and manage your account.</li>
            <li>To facilitate bookings and messaging between users and companions.</li>
            <li>To verify the identity and age of companions and customers.</li>
            <li>To send transactional notifications about your bookings.</li>
            <li>To detect fraud, abuse, and violations of our community standards.</li>
            <li>To comply with applicable laws and legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">4. Sharing your information</h2>
          <p className="mt-3">We do not sell your personal data. We may share limited information with:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><strong>Service providers:</strong> Supabase (database and auth), Vercel (hosting), and payment processors.</li>
            <li><strong>Law enforcement:</strong> When required by law or to protect safety.</li>
            <li><strong>Other users:</strong> Only the information you choose to display on your public profile.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">5. Data retention</h2>
          <p className="mt-3">We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by contacting us. Some data may be retained for legal compliance for up to 7 years.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">6. Your rights</h2>
          <p className="mt-3">You have the right to access, correct, or delete your personal data. You may also request a portable copy of your data. To exercise these rights, contact us at <a href="mailto:privacy@rentgf.com" className="text-[#c36d4d] underline">privacy@rentgf.com</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">7. Security</h2>
          <p className="mt-3">We use industry-standard encryption and access controls to protect your data. All passwords are hashed and never stored in plaintext. However, no system is completely secure and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">8. Age requirement</h2>
          <p className="mt-3">RentGF is strictly for adults aged 18 and above. We verify age during registration and companion onboarding. Any account found to belong to a minor will be immediately terminated.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">9. Changes to this policy</h2>
          <p className="mt-3">We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice on our platform. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#173f35]">10. Contact</h2>
          <p className="mt-3">For privacy-related questions, contact us at <a href="mailto:privacy@rentgf.com" className="text-[#c36d4d] underline">privacy@rentgf.com</a>.</p>
        </section>
      </div>

      <div className="mt-16 flex gap-6 text-sm text-[#68756e]">
        <Link href="/terms" className="hover:text-[#173f35]">Terms of Service</Link>
        <Link href="/contact" className="hover:text-[#173f35]">Contact</Link>
        <Link href="/" className="hover:text-[#173f35]">Home</Link>
      </div>
    </main>
  )
}
