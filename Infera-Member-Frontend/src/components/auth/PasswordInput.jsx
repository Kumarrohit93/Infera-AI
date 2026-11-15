import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

function PasswordInput({ value, onChange, onFocus, onBlur }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Enter your password"
        autoComplete="current-password"
        required
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100"
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}

export default PasswordInput