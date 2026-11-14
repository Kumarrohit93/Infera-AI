import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary frontend navigation
    // Authentication API will be connected later
    navigate("/dashboard");
  };

  return (
    <div className="min-h-dvh w-full bg-[#F8F4E7] lg:h-dvh lg:min-h-0 lg:overflow-hidden">

      <div className="grid min-h-dvh w-full grid-cols-1
        lg:h-full lg:min-h-0 lg:grid-cols-[45%_55%]">

        {/* LEFT BRANDING SECTION (Hidden on mobile/tablet, visible on laptop lg+) */}
        <section className="relative hidden lg:flex min-h-[620px] flex-col
          justify-between overflow-hidden bg-[#722F37]
          px-7 py-8 text-white
          sm:px-12 lg:min-h-0 lg:px-9 lg:py-7
          xl:px-14 xl:py-9">

          {/* Background Shapes */}
          <div className="absolute -right-20 -top-24
            h-72 w-72 rounded-full bg-[#D7A781]/20 blur-3xl" />

          <div className="absolute -bottom-32 -left-20
            h-80 w-80 rounded-full bg-[#D7A781]/10" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0
              items-center justify-center rounded-xl bg-white p-2">
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Infera <span className="text-[#D7A781]">AI</span>
              </h1>
              <p className="text-sm text-white/70">
                Chat with Your Documents
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 my-8 lg:my-3">
            <p className="mb-5 text-xs font-semibold uppercase
              tracking-[3px] text-[#D7A781] sm:tracking-[4px]">
              Your Knowledge Workspace
            </p>

            <h2 className="text-4xl font-bold leading-tight
              sm:text-5xl xl:text-6xl">
              Your Knowledge.
              <br />
              Powered by <span className="text-[#D7A781]">AI.</span>
            </h2>

            <div className="mb-6 mt-7 h-1.5 w-28
              rounded-full bg-[#D7A781]" />

            <p className="text-base leading-relaxed text-white/75 sm:text-lg">
              Ask. Explore. Get Answers —
              <br />
              from your documents.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative z-10 flex items-center
            justify-center gap-6 pb-5 sm:gap-10 lg:gap-5">

            {/* Documents */}
            <div className="relative h-36 w-32 sm:h-40 sm:w-36">
              <div className="absolute left-0 top-5 h-32 w-24
                rotate-[-12deg] rounded-2xl bg-[#F8F4E7]
                p-3 shadow-xl sm:h-36 sm:w-28 sm:p-4">
                <div className="mt-4 rounded-lg bg-[#D7A781]
                  py-3 text-center font-bold text-[#722F37]">
                  PDF
                </div>
                <div className="mt-5 h-2 rounded bg-[#D9C8B8]" />
                <div className="mt-3 h-2 w-3/4 rounded bg-[#D9C8B8]" />
              </div>

              <div className="absolute right-0 top-0 h-36 w-24
                rotate-[8deg] rounded-2xl bg-white p-3 shadow-xl
                sm:h-40 sm:w-28 sm:p-4">
                <div className="mt-4 rounded-lg bg-[#722F37]
                  py-3 text-center font-bold text-white">
                  DOC
                </div>
                <div className="mt-5 h-2 rounded bg-[#D9C8B8]" />
                <div className="mt-3 h-2 w-3/4 rounded bg-[#D9C8B8]" />
              </div>
            </div>

            {/* AI Assistant */}
            <div className="relative flex flex-col items-center">
              <div className="absolute -right-2 -top-11
                rounded-xl bg-[#F8F4E7] px-5 py-3
                text-[#722F37] shadow-lg">
                <span className="text-xl tracking-widest">•••</span>
              </div>

              <div className="flex h-28 w-32 flex-col items-center
                justify-center rounded-[42%] border-[7px]
                border-[#D7A781] bg-[#F8F4E7] shadow-xl
                sm:h-32 sm:w-36">
                <div className="mb-3 flex gap-6">
                  <span className="h-3 w-3 rounded-full bg-[#722F37]" />
                  <span className="h-3 w-3 rounded-full bg-[#722F37]" />
                </div>
                <div className="h-1.5 w-12 rounded-full bg-[#D7A781]" />
                <span className="mt-2 text-xs font-bold text-[#722F37]">
                  AI
                </span>
              </div>

              <div className="mt-2 h-6 w-32 rounded-t-full bg-[#D7A781]" />
            </div>

          </div>

          {/* Copyright */}
          <p className="relative z-10 text-xs text-white/50">
            © 2026 Infera AI. All rights reserved.
          </p>

        </section>

        {/* RIGHT LOGIN SECTION (Full width on mobile, 55% on laptop) */}
        <section className="relative flex min-h-[100dvh] lg:min-h-[650px]
          items-center justify-center overflow-hidden
          bg-[#F8F4E7] px-5 py-10
          sm:px-10 lg:min-h-0 lg:h-full lg:px-8 lg:py-6
          xl:px-14">

          {/* Background Shapes */}
          <div className="absolute right-0 top-0
            h-40 w-40 rounded-bl-full bg-[#D7A781]/30" />

          <div className="absolute bottom-0 left-0
            h-36 w-36 rounded-tr-full bg-[#D7A781]/20" />

          {/* Login Card */}
          <div className="relative z-10 w-full max-w-[530px]
            rounded-[28px] border border-white bg-white/90
            px-6 py-8 shadow-xl
            sm:px-10 sm:py-9 xl:px-12">

            {/* Heading */}
            <div className="mb-7 text-center">
              <h2 className="text-4xl font-bold text-[#722F37]
                sm:text-5xl">
                Member <span className="text-[#D7A781]">Login</span>
              </h2>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Access your organisation's knowledge base
              </p>

              <div className="mx-auto mt-5 h-1.5 w-24
                rounded-full bg-[#D7A781]" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold
                  text-[#722F37]">
                  Email Address
                </label>

                <div className="flex h-14 items-center rounded-xl
                  border-2 border-gray-200 px-4 transition
                  focus-within:border-[#D7A781]">
                  <span className="text-xl text-[#722F37]">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-full w-full bg-transparent
                      px-4 text-sm text-[#722F37] outline-none
                      placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold
                  text-[#722F37]">
                  Password
                </label>

                <div className="flex h-14 items-center rounded-xl
                  border-2 border-gray-200 px-4 transition
                  focus-within:border-[#D7A781]">
                  <span className="text-lg">🔒</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-full w-full bg-transparent
                      px-4 text-sm text-[#722F37] outline-none
                      placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm font-medium text-gray-500
                      hover:text-[#722F37]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex flex-wrap items-center
                justify-between gap-3 text-sm">
                <label className="flex cursor-pointer
                  items-center gap-2 text-[#722F37]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 accent-[#722F37]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="font-semibold text-[#722F37]
                    hover:text-[#D7A781]"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="h-14 w-full rounded-xl bg-[#722F37]
                  text-base font-semibold text-white shadow-lg
                  transition-all duration-300
                  hover:-translate-y-1 hover:bg-[#5B242C]"
              >
                Login →
              </button>

            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-500">
                Member Access
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Contact Admin */}
            <p className="text-center text-sm text-gray-500">
              Need help accessing your account?{" "}
              <button
                type="button"
                className="font-semibold text-[#722F37]
                  hover:text-[#D7A781]"
              >
                Contact Admin
              </button>
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}