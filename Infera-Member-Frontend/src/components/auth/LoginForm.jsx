import { useState } from 'react'
import { ArrowRight, Mail, CheckCircle2 } from 'lucide-react'
import PasswordInput from './PasswordInput'

function LoginForm({ onEmailFocus, onPasswordFocus }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    // Demo UI only. Replace with the real backend authentication call.
    setTimeout(() => {
      setLoading(false)
      setMessage('Your login form is ready. Backend authentication is not connected yet.')
    }, 700)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Work Email
        </label>

        <div className="relative">
          <Mail
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onFocus={onEmailFocus}
            onBlur={() => onEmailFocus?.(false)}
            placeholder="you@company.com"
            autoComplete="email"
            required
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <a
            href="#forgot-password"
            className="text-xs font-semibold text-violet-700 transition hover:text-violet-950"
          >
            Forgot password?
          </a>
        </div>

        <PasswordInput
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onFocus={onPasswordFocus}
          onBlur={() => onPasswordFocus?.(false)}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-violet-700"
          />
          Remember this device
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-800 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-900 hover:shadow-xl hover:shadow-violet-900/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Signing in...' : 'Continue to Workspace'}
        {!loading && (
          <ArrowRight
            size={17}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        )}
      </button>

      {message && (
        <div
          role="status"
          className="flex gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3 text-xs leading-5 text-violet-800"
        >
          <CheckCircle2 size={17} className="shrink-0" />
          {message}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={() => setMessage('Google authentication will be connected later.')}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition duration-300 hover:border-violet-300 hover:bg-violet-50"
      >
        <span className="bg-gradient-to-r from-blue-500 via-green-500 to-red-500 bg-clip-text text-lg font-bold text-transparent">
          G
        </span>
        Continue with Google
      </button>

      <p className="text-center text-xs text-slate-500">
        Don't have access yet?{' '}
        <a
          href="mailto:admin@infera.ai"
          className="font-semibold text-violet-800 transition hover:text-violet-950"
        >
          Contact your administrator
        </a>
      </p>
    </form>
  )
}

export default LoginForm