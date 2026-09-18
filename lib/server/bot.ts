import { platformSettings } from '@/lib/domain/rentgf'

export type BotReply = { text: string; suggestions: string[]; href?: string }
const rules: Array<{ keys: string[]; reply: () => BotReply }> = [
  { keys: ['book', 'booking', 'kaise kare', 'kaise karu', 'process'], reply: () => ({ text: 'Booking ke liye companion profile open karein, available date aur time select karein, details review karein aur request submit karein.', suggestions: ['What does access cost?', 'Safety rules', 'Cancellation policy'], href: '/discover' }) },
  { keys: ['price', 'cost', 'fee', '499', 'paisa', 'kitna'], reply: () => ({ text: `Current one-time platform access is ${platformSettings.currency} ${platformSettings.accessFee.toLocaleString('en-IN')}. Final prices are calculated securely when you check out.`, suggestions: ['How to book?', 'Refund policy'] }) },
  { keys: ['refund', 'wapas', 'paise'], reply: () => ({ text: platformSettings.refundPolicy, suggestions: ['Cancellation policy', 'How to book?'] }) },
  { keys: ['cancel', 'cancellation', 'cancel kar'], reply: () => ({ text: platformSettings.cancellationPolicy, suggestions: ['Refund policy', 'How to book?'] }) },
  { keys: ['safe', 'safety', 'secure', '18', 'age', 'sexual'], reply: () => ({ text: 'RentGF is for adults 18+ and lawful, non-sexual social companionship only. Meet in public, protect your personal information, and report anything that feels unsafe.', suggestions: ['Read safety guidelines', '18+ policy'], href: '/safety' }) },
  { keys: ['verify', 'verification', 'kyc'], reply: () => ({ text: 'Companions complete identity verification before their profile can become visible. Verification documents are private and are never shown on public profiles.', suggestions: ['Become a companion', 'Safety rules'] }) },
  { keys: ['login', 'sign in', 'register', 'signup', 'account'], reply: () => ({ text: 'You can create an account with your email and confirm that you are 18 or older. Account security and password recovery are handled through the authentication provider when connected.', suggestions: ['How to book?', 'Safety rules'], href: '/login' }) },
]
export function answerBot(message: string): BotReply {
  const normalized = message.toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/g, ' ').replace(/\s+/g, ' ').trim()
  const match = rules.find((rule) => rule.keys.some((key) => normalized.includes(key)))
  return match?.reply() ?? { text: 'I’m not able to find an answer for that yet. Please choose a topic below or contact support.', suggestions: ['How to book?', 'What does access cost?', 'Safety rules', 'Contact support'], href: '/support' }
}
