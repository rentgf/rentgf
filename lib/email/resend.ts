import { Resend } from 'resend'
import {
  otpTemplate,
  welcomeTemplate,
  bookingRequestTemplate,
  bookingConfirmedTemplate,
  bookingCancelledTemplate,
  paymentReceiptTemplate,
  companionApprovedTemplate,
  companionRejectedTemplate,
  bookingReminderTemplate,
} from './templates'

// Resend client – RESEND_API_KEY must be set in Vercel environment variables
const getResend = () => new Resend(process.env.RESEND_API_KEY ?? '')

export function getSender() {
  return process.env.EMAIL_FROM ?? 'RentGF <no-reply@rentgf.site>'
}

export async function sendOtpEmail(to: string, name: string, otp: string) {
  return getResend().emails.send({
    from: getSender(),
    to,
    subject: `${otp} is your RentGF verification code`,
    html: otpTemplate(name, otp),
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  return getResend().emails.send({
    from: getSender(),
    to,
    subject: `Welcome to RentGF, ${name}!`,
    html: welcomeTemplate(name),
  })
}

export async function sendBookingRequestEmail(
  companionEmail: string, companionName: string, customerName: string,
  date: string, hours: number, amount: number, bookingId: string,
) {
  return getResend().emails.send({
    from: getSender(), to: companionEmail,
    subject: `New booking request from ${customerName}`,
    html: bookingRequestTemplate(companionName, customerName, date, hours, amount, bookingId),
  })
}

export async function sendBookingConfirmedEmail(
  customerEmail: string, customerName: string, companionName: string,
  date: string, hours: number, amount: number, bookingId: string,
) {
  return getResend().emails.send({
    from: getSender(), to: customerEmail,
    subject: `Booking confirmed with ${companionName}!`,
    html: bookingConfirmedTemplate(customerName, companionName, date, hours, amount, bookingId),
  })
}

export async function sendBookingCancelledEmail(
  recipientEmail: string, recipientName: string, otherPartyName: string,
  date: string, refund: boolean, bookingId: string,
) {
  return getResend().emails.send({
    from: getSender(), to: recipientEmail,
    subject: `Booking with ${otherPartyName} has been cancelled`,
    html: bookingCancelledTemplate(recipientName, otherPartyName, date, refund, bookingId),
  })
}

export async function sendPaymentReceiptEmail(
  customerEmail: string, customerName: string, companionName: string,
  date: string, amount: number, orderId: string, bookingId: string,
) {
  return getResend().emails.send({
    from: getSender(), to: customerEmail,
    subject: `Payment receipt – ₹${amount.toLocaleString('en-IN')} for ${companionName}`,
    html: paymentReceiptTemplate(customerName, companionName, date, amount, orderId, bookingId),
  })
}

export async function sendCompanionApprovedEmail(to: string, name: string) {
  return getResend().emails.send({
    from: getSender(), to,
    subject: `🎉 Your RentGF companion profile is approved!`,
    html: companionApprovedTemplate(name),
  })
}

export async function sendCompanionRejectedEmail(to: string, name: string, reason?: string) {
  return getResend().emails.send({
    from: getSender(), to,
    subject: `Update on your RentGF companion application`,
    html: companionRejectedTemplate(name, reason),
  })
}

export async function sendBookingReminderEmail(
  recipientEmail: string, recipientName: string, companionName: string, date: string, bookingId: string,
) {
  return getResend().emails.send({
    from: getSender(), to: recipientEmail,
    subject: `Reminder: Your booking with ${companionName} is tomorrow`,
    html: bookingReminderTemplate(recipientName, companionName, date, bookingId),
  })
}
