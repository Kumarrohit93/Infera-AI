const COOKIE_NAME = "infera_refresh"
const refreshDays = Math.max(1, Number(process.env.JWT_REFRESH_DAYS) || 7)

function cookieOptions() {
  const production = process.env.NODE_ENV === "production"
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/api/auth",
    maxAge: refreshDays * 24 * 60 * 60 * 1000,
  }
}

function readCookie(request, name) {
  const cookies = String(request.headers.cookie || "").split(";")
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`))
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null
}

function sendSession(res, session, status = 200) {
  const { refreshToken, ...data } = session
  res.cookie(COOKIE_NAME, refreshToken, cookieOptions())
  res.status(status).json({ success: true, data })
}

function clearSessionCookie(res) {
  const { maxAge, ...options } = cookieOptions()
  res.clearCookie(COOKIE_NAME, options)
}

module.exports = { COOKIE_NAME, readCookie, sendSession, clearSessionCookie }
