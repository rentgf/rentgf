// RentGF branded HTML email templates

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentgf.site'

function baseLayout(content: string, preview = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RentGF</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${BASE_URL}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">rent<span style="color:#d17b58;">gf</span></span>
              </a>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #e9e2d9;box-shadow:0 4px 24px rgba(23,63,53,.07);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9aa49d;line-height:1.6;">
                18+ only &middot; Lawful, non-sexual companionship<br/>
                <a href="${BASE_URL}/terms" style="color:#9aa49d;">Terms</a> &middot;
                <a href="${BASE_URL}/privacy-policy" style="color:#9aa49d;">Privacy</a> &middot;
                <a href="${BASE_URL}/contact" style="color:#9aa49d;">Contact</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#b8c2be;">&copy; ${new Date().getFullYear()} RentGF. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function btn(text: string, url: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="border-radius:12px;background:#173f35;">
        <a href="${url}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${text}</a>
      </td>
    </tr>
  </table>`
}

function divider() {
  return `<tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #f0ebe4;margin:4px 0;" /></td></tr>`
}

// ─────────────────────────────────────────
// 1. OTP Verification
// ─────────────────────────────────────────
export function otpTemplate(name: string, otp: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#edf4ed;border-radius:12px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:22px;">🔐</span>
      </div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Verify your email</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${name}, enter the code below to confirm your RentGF account.</p>
    </td></tr>
    <tr><td style="padding:28px 32px 24px;text-align:center;">
      <div style="display:inline-block;background:#f5f3ef;border:2px solid #e9e2d9;border-radius:16px;padding:24px 40px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9aa49d;letter-spacing:0.1em;text-transform:uppercase;">Your verification code</p>
        <p style="margin:0;font-size:40px;font-weight:800;color:#173f35;letter-spacing:0.15em;font-variant-numeric:tabular-nums;">${otp}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#9aa49d;">Valid for 10 minutes</p>
      </div>
    </td></tr>
    ${divider()}
    <tr><td style="padding:20px 32px 32px;">
      <p style="margin:0;font-size:13px;color:#9aa49d;line-height:1.6;">If you didn't create a RentGF account, you can safely ignore this email. Never share this code with anyone.</p>
    </td></tr>`
  return baseLayout(content, `Your RentGF verification code is ${otp}`)
}

// ─────────────────────────────────────────
// 2. Welcome
// ─────────────────────────────────────────
export function welcomeTemplate(name: string) {
  const content = `
    <tr><td style="padding:36px 32px 24px;">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Welcome to RentGF 👋</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${name}, your account is verified and ready to go.</p>
    </td></tr>
    <tr><td style="padding:0 32px 28px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#173f35;">Get started in 3 steps</p>
          <p style="margin:0 0 8px;font-size:14px;color:#52645b;">✅ &nbsp;Create your account</p>
          <p style="margin:0 0 8px;font-size:14px;color:#8a9490;">🔍 &nbsp;Discover companions in your city</p>
          <p style="margin:0;font-size:14px;color:#8a9490;">📅 &nbsp;Send a booking request</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 32px 36px;">
      ${btn('Discover companions →', `${BASE_URL}/discover`)}
    </td></tr>`
  return baseLayout(content, `Welcome to RentGF, ${name}! Your account is ready.`)
}

// ─────────────────────────────────────────
// 3. Booking Request (to companion)
// ─────────────────────────────────────────
export function bookingRequestTemplate(companionName: string, customerName: string, date: string, hours: number, amount: number, bookingId: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#fff8ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">📅</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">New booking request</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${companionName}, you have a new booking request from <strong>${customerName}</strong>.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="font-size:13px;color:#8a9490;padding-bottom:4px;">Date &amp; time</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${date}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding:8px 0 4px;">Duration</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${hours} hour${hours !== 1 ? 's' : ''}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding-top:8px;">Amount</td><td style="font-size:14px;font-weight:700;color:#d17b58;text-align:right;">₹${amount.toLocaleString('en-IN')}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 36px;">
      ${btn('Review request →', `${BASE_URL}/dashboard/bookings/${bookingId}`)}
      <p style="margin:16px 0 0;font-size:13px;color:#9aa49d;">You have 24 hours to accept or decline.</p>
    </td></tr>`
  return baseLayout(content, `New booking request from ${customerName} on ${date}`)
}

// ─────────────────────────────────────────
// 4. Booking Confirmed (to customer)
// ─────────────────────────────────────────
export function bookingConfirmedTemplate(customerName: string, companionName: string, date: string, hours: number, amount: number, bookingId: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#edf4ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">✅</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Booking confirmed!</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${customerName}, <strong>${companionName}</strong> has accepted your booking. See you soon!</p>
    </td></tr>
    <tr><td style="padding:20px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="font-size:13px;color:#8a9490;padding-bottom:4px;">Companion</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${companionName}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding:8px 0 4px;">Date &amp; time</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${date}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding:8px 0 4px;">Duration</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${hours} hour${hours !== 1 ? 's' : ''}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding-top:8px;">Total paid</td><td style="font-size:14px;font-weight:700;color:#d17b58;text-align:right;">₹${amount.toLocaleString('en-IN')}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 36px;">
      ${btn('View booking details →', `${BASE_URL}/dashboard/bookings/${bookingId}`)}
    </td></tr>`
  return baseLayout(content, `Your booking with ${companionName} on ${date} is confirmed!`)
}

// ─────────────────────────────────────────
// 5. Booking Cancelled
// ─────────────────────────────────────────
export function bookingCancelledTemplate(recipientName: string, otherPartyName: string, date: string, refund: boolean, bookingId: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#fff3ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">❌</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Booking cancelled</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${recipientName}, your booking with <strong>${otherPartyName}</strong> on <strong>${date}</strong> has been cancelled.</p>
    </td></tr>
    <tr><td style="padding:20px 32px 36px;">
      ${refund ? `<div style="background:#edf4ed;border-radius:12px;padding:16px 20px;"><p style="margin:0;font-size:14px;color:#4e8068;font-weight:600;">💚 Refund initiated</p><p style="margin:6px 0 0;font-size:13px;color:#52645b;">Your payment will be refunded within 5–7 business days.</p></div>` : ''}
      <p style="margin:${refund ? '16px' : '0'} 0 0;font-size:13px;color:#9aa49d;">Booking ID: <code style="font-family:monospace;">${bookingId.slice(0, 8)}</code></p>
    </td></tr>`
  return baseLayout(content, `Booking with ${otherPartyName} on ${date} has been cancelled`)
}

// ─────────────────────────────────────────
// 6. Payment Receipt
// ─────────────────────────────────────────
export function paymentReceiptTemplate(customerName: string, companionName: string, date: string, amount: number, orderId: string, bookingId: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#edf4ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🧾</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Payment receipt</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${customerName}, here is your payment confirmation for your booking with ${companionName}.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr><td style="font-size:13px;color:#8a9490;padding-bottom:4px;">Companion</td><td style="font-size:14px;font-weight:600;color:#173f35;text-align:right;">${companionName}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding:8px 0 4px;">Date</td><td style="font-size:14px;color:#173f35;text-align:right;">${date}</td></tr>
            <tr><td style="font-size:13px;color:#8a9490;padding:8px 0 4px;">Order ID</td><td style="font-size:13px;font-family:monospace;color:#68756e;text-align:right;">${orderId}</td></tr>
            <tr><td colspan="2"><hr style="border:none;border-top:1px solid #e9e2d9;margin:12px 0;" /></td></tr>
            <tr><td style="font-size:15px;font-weight:700;color:#173f35;">Total paid</td><td style="font-size:18px;font-weight:800;color:#d17b58;text-align:right;">₹${amount.toLocaleString('en-IN')}</td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 36px;">
      ${btn('View booking →', `${BASE_URL}/dashboard/bookings/${bookingId}`)}
    </td></tr>`
  return baseLayout(content, `Payment of ₹${amount.toLocaleString('en-IN')} confirmed for your booking with ${companionName}`)
}

// ─────────────────────────────────────────
// 7. Companion Approved
// ─────────────────────────────────────────
export function companionApprovedTemplate(name: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#edf4ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">🎉</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">You're approved!</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${name}, congratulations! Your companion profile has been reviewed and approved. You're now live on RentGF.</p>
    </td></tr>
    <tr><td style="padding:16px 32px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#173f35;">What's next?</p>
          <p style="margin:0 0 8px;font-size:14px;color:#52645b;">📸 &nbsp;Complete your profile with photos</p>
          <p style="margin:0 0 8px;font-size:14px;color:#52645b;">🗓️ &nbsp;Set your availability</p>
          <p style="margin:0;font-size:14px;color:#52645b;">✨ &nbsp;Start receiving booking requests</p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 32px 36px;">
      ${btn('Go to your dashboard →', `${BASE_URL}/dashboard`)}
    </td></tr>`
  return baseLayout(content, `${name}, your RentGF companion profile is approved!`)
}

// ─────────────────────────────────────────
// 8. Companion Rejected
// ─────────────────────────────────────────
export function companionRejectedTemplate(name: string, reason?: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Application update</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${name}, thank you for applying to become a companion on RentGF. After review, we're unable to approve your profile at this time.</p>
    </td></tr>
    ${reason ? `<tr><td style="padding:16px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff8f5;border-left:3px solid #d17b58;border-radius:0 12px 12px 0;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#9aa49d;text-transform:uppercase;letter-spacing:0.06em;">Reason</p>
          <p style="margin:0;font-size:14px;color:#52645b;line-height:1.6;">${reason}</p>
        </td></tr>
      </table>
    </td></tr>` : ''}
    <tr><td style="padding:16px 32px 36px;">
      <p style="margin:0 0 20px;font-size:14px;color:#52645b;line-height:1.6;">You may reapply after making the necessary changes. If you believe this is an error, please contact our support team.</p>
      ${btn('Contact support →', `${BASE_URL}/contact`)}
    </td></tr>`
  return baseLayout(content, `Update on your RentGF companion application`)
}

// ─────────────────────────────────────────
// 9. Booking Reminder (24h before)
// ─────────────────────────────────────────
export function bookingReminderTemplate(recipientName: string, companionName: string, date: string, bookingId: string) {
  const content = `
    <tr><td style="padding:36px 32px 8px;">
      <div style="width:44px;height:44px;background:#fff8ed;border-radius:12px;text-align:center;line-height:44px;font-size:22px;">⏰</div>
      <h1 style="margin:20px 0 8px;font-size:24px;font-weight:700;color:#173f35;letter-spacing:-0.03em;">Your booking is tomorrow</h1>
      <p style="margin:0;font-size:15px;color:#52645b;line-height:1.6;">Hi ${recipientName}, just a friendly reminder about your upcoming time with <strong>${companionName}</strong>.</p>
    </td></tr>
    <tr><td style="padding:20px 32px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f5f3ef;border-radius:14px;">
        <tr><td style="padding:16px 24px;">
          <p style="margin:0;font-size:14px;color:#52645b;"><strong style="color:#173f35;">📅 ${date}</strong></p>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 36px;">
      ${btn('View details →', `${BASE_URL}/dashboard/bookings/${bookingId}`)}
    </td></tr>`
  return baseLayout(content, `Reminder: Your booking with ${companionName} is tomorrow!`)
}
