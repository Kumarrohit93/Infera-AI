import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const AUTH_API_URL = import.meta.env.VITE_AUTH_URL || 'https://infera-ai.onrender.com/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error?.message || 'Could not reset the password.');
      }
      toast.success('Password updated. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Could not reset the password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#FAF7F2] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-[#E8DCD1] bg-white p-7 shadow-lg">
        <h1 className="text-xl font-bold text-[#4A3023]">Choose a new password</h1>
        {!token && <p role="alert" className="text-sm text-red-700">This reset link is missing its token.</p>}
        <label className="block text-sm font-medium text-[#25211E]">New password
          <input required minLength={8} maxLength={72} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#E8DCD1] p-3" />
        </label>
        <label className="block text-sm font-medium text-[#25211E]">Confirm password
          <input required minLength={8} maxLength={72} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-[#E8DCD1] p-3" />
        </label>
        <button disabled={!token || loading} className="w-full rounded-lg bg-[#96613F] p-3 font-semibold text-white disabled:opacity-60">
          {loading ? 'Updating...' : 'Update password'}
        </button>
        <Link to="/login" className="block text-center text-sm text-[#96613F]">Back to sign in</Link>
      </form>
    </main>
  );
}
