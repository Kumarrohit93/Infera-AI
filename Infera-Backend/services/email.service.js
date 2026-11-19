const { emailFrom, resendApiKey } = require("../config/env")

async function sendEmail({ to, subject, html }) {
  if (!resendApiKey || !emailFrom) {
    if (process.env.NODE_ENV !== "production") return false
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM.")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: emailFrom, to: [to], subject, html }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Email delivery failed (${response.status}): ${message}`)
  }

  return true
}

module.exports = { sendEmail }
