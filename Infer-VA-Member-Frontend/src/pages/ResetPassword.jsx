import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      navigate("/", { replace: true, state: { message: "Password updated. Please sign in." } });
    } catch (requestError) {
      setError(requestError.message || "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[#F8F4E7] px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[#722F37]">Choose a new password</h1>
        {!token && <p role="alert" className="text-sm text-red-700">This reset link is missing its token.</p>}
        <label className="block text-sm font-medium">New password
          <input required minLength={8} maxLength={72} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border p-3" />
        </label>
        <label className="block text-sm font-medium">Confirm password
          <input required minLength={8} maxLength={72} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-lg border p-3" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={!token || loading} className="w-full rounded-lg bg-[#722F37] p-3 font-semibold text-white disabled:opacity-60">
          {loading ? "Updating..." : "Update password"}
        </button>
        <Link to="/" className="block text-center text-sm text-[#722F37]">Back to sign in</Link>
      </form>
    </main>
  );
}
