
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend API integration will be added later.
    console.log({
      email,
      password,
      remember,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4EDE0] flex items-center justify-center md:p-6">

      <div className="w-full max-w-[1450px] min-h-screen md:min-h-[850px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden md:rounded-[28px] md:shadow-2xl">

        {/* LEFT BRANDING SECTION */}

        <section className="relative bg-[#14213D] text-white px-8 py-10 md:px-14 md:py-12 flex flex-col justify-between overflow-hidden min-h-[550px]">

          {/* Background decoration */}
          <div className="absolute -top-24 -right-20 w-72 h-72 bg-[#F5B69E]/20 rounded-full blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-[#F5B69E]/10 rounded-full" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-4">

            <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center">
              <img
                src="/infera-logo.jpeg"
                alt="Infera AI Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Infera <span className="text-[#F5B69E]">AI</span>
              </h1>

              <p className="text-sm text-white/70">
                Chat with Your Documents
              </p>
            </div>

          </div>

          {/* Main content */}
          <div className="relative z-10 my-12">

            <p className="text-[#F5B69E] uppercase tracking-[4px] text-xs font-semibold mb-5">
              Your Knowledge Workspace
            </p>

            <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
              Your Knowledge.
              <br />
              Powered by <span className="text-[#F5B69E]">AI.</span>
            </h2>

            <div className="w-28 h-1.5 bg-[#F5B69E] rounded-full mt-8 mb-7" />

            <p className="text-lg text-white/75 leading-relaxed">
              Ask. Explore. Get Answers —
              <br />
              from your documents.
            </p>

          </div>

          {/* Illustration */}
          <div className="relative z-10 flex items-center justify-center gap-8 pb-8">

            {/* Document card */}
            <div className="relative w-36 h-44">

              <div className="absolute left-0 top-5 rotate-[-12deg] w-28 h-36 bg-[#F4EDE0] rounded-2xl p-4 shadow-xl">

                <div className="bg-[#F5B69E] text-[#14213D] font-bold text-center rounded-lg py-3 mt-4">
                  PDF
                </div>

                <div className="h-2 bg-[#D9C8B8] rounded mt-5" />
                <div className="h-2 bg-[#D9C8B8] rounded mt-3 w-3/4" />

              </div>

              <div className="absolute right-0 top-0 rotate-[8deg] w-28 h-40 bg-white rounded-2xl p-4 shadow-xl">

                <div className="bg-[#4267A9] text-white font-bold text-center rounded-lg py-3 mt-4">
                  DOC
                </div>

                <div className="h-2 bg-[#D9C8B8] rounded mt-5" />
                <div className="h-2 bg-[#D9C8B8] rounded mt-3 w-3/4" />

              </div>

            </div>

            {/* AI assistant */}
            <div className="flex flex-col items-center relative">

              <div className="absolute -top-12 right-0 bg-[#F4EDE0] text-[#14213D] rounded-xl px-5 py-3 shadow-lg">
                <span className="text-xl tracking-widest">•••</span>
              </div>

              <div className="w-32 h-28 md:w-40 md:h-36 rounded-[42%] bg-[#F4EDE0] border-[7px] border-[#F5B69E] flex flex-col items-center justify-center shadow-xl">

                <div className="flex gap-6 mb-3">
                  <span className="w-3 h-3 bg-[#14213D] rounded-full" />
                  <span className="w-3 h-3 bg-[#14213D] rounded-full" />
                </div>

                <div className="w-12 h-1.5 bg-[#F5B69E] rounded-full" />

                <span className="text-[#14213D] font-bold text-xs mt-2">
                  AI
                </span>

              </div>

              <div className="w-36 h-6 bg-[#F5B69E] rounded-t-full mt-2" />

            </div>

          </div>

          <p className="relative z-10 text-xs text-white/40">
            © 2026 Infera AI. All rights reserved.
          </p>

        </section>

        {/* RIGHT LOGIN SECTION */}

        <section className="relative bg-[#F4EDE0] flex items-center justify-center px-5 py-12 md:px-10 lg:px-14">

          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F5B69E]/30 rounded-bl-full" />

          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#F5B69E]/20 rounded-tr-full" />

          {/* Login card */}
          <div className="relative z-10 w-full max-w-[530px] bg-white/90 border border-white rounded-[28px] shadow-xl px-6 py-10 sm:px-10 md:px-12">

            {/* Heading */}
            <div className="text-center mb-9">

              <h2 className="text-4xl md:text-5xl font-bold text-[#14213D]">
                Member <span className="text-[#F5B69E]">Login</span>
              </h2>

              <p className="text-gray-600 mt-3">
                Access your organisation's knowledge base
              </p>

              <div className="w-24 h-1.5 bg-[#F5B69E] rounded-full mx-auto mt-6" />

            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Email */}
              <div>

                <label className="block text-sm font-semibold text-[#14213D] mb-2">
                  Email Address
                </label>

                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 h-14 focus-within:border-[#F5B69E] transition">

                  <span className="text-xl text-[#14213D]">✉</span>

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-full outline-none bg-transparent px-4 text-[#14213D] placeholder:text-gray-400"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="block text-sm font-semibold text-[#14213D] mb-2">
                  Password
                </label>

                <div className="flex items-center border-2 border-gray-200 rounded-xl px-4 h-14 focus-within:border-[#F5B69E] transition">

                  <span className="text-xl text-[#14213D]">🔒</span>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-full outline-none bg-transparent px-4 text-[#14213D] placeholder:text-gray-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-[#14213D] text-sm font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Remember me and Forgot Password */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">

                <label className="flex items-center gap-2 text-[#14213D] cursor-pointer">

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-[#14213D]"
                  />

                  Remember me

                </label>

                <button
                  type="button"
                  className="font-semibold text-[#14213D] hover:text-[#F5B69E]"
                >
                  Forgot Password?
                </button>

              </div>

              {/* Login button */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-[#14213D] hover:bg-[#20375F] text-white text-lg font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                Login →
              </button>

            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">

              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-gray-500 text-sm">
                Member Access
              </span>

              <div className="flex-1 h-px bg-gray-200" />

            </div>

            {/* Contact admin */}
            <p className="text-center text-gray-500 text-sm">
              Need help accessing your account?{" "}

              <button
                type="button"
                className="font-semibold text-[#14213D] hover:text-[#F5B69E]"
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
