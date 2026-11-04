const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function login({ email, password, rememberMe }) {
  if (!API_BASE_URL) {
    throw new Error(
      'Sign-in is not configured yet. Set VITE_API_BASE_URL to your authentication API.',
    )
  }

  const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, rememberMe }),
  })

  const responseText = await response.text()
  let payload = null
  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      throw new Error('The authentication service returned an invalid response.')
    }
  }

  if (!response.ok) {
    throw new Error(
      payload?.message || 'Email or password is incorrect. Please try again.',
    )
  }

  return payload
}