import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle,
  FileText,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Strict Admin Login validation
  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (trimmedEmail === 'admin@infera.ai' && trimmedPassword === 'admin123') {
        localStorage.setItem('isAdminAuth', 'true');
        toast.success('Admin login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Only authorized administrators can sign in.');
      }
    }, 700);
  };

  // Google Workspace SSO handler
  const handleGoogleSSO = () => {
    setIsSsoLoading(true);
    toast.loading('Connecting to Google Workspace SSO...', { id: 'sso-toast' });
    setTimeout(() => {
      setIsSsoLoading(false);
      toast.dismiss('sso-toast');
      localStorage.setItem('isAdminAuth', 'true');
      toast.success('SSO authentication verified!');
      navigate('/dashboard');
    }, 1200);
  };

  // Forgot password submit
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your work email address.');
      return;
    }
    setResetSent(true);
    toast.success('Password reset link has been dispatched.');
  };

  // 4 Feature highlight cards data
  const featureCards = [
    {
      id: 1,
      title: '1. Manage Documents',
      description: 'Upload PDF, DOCX, and TXT files with automated chunking and vector indexing.',
      icon: <FileText className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 2,
      title: '2. Control Team Access',
      description: 'Configure granular folder-level permissions across HR, IT, Finance, and Operations.',
      icon: <ShieldCheck className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 3,
      title: '3. AI Assistant',
      description: 'Ask natural-language questions and get instant answers with exact page citations.',
      icon: <MessageSquare className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 4,
      title: '4. Insights & Feedback',
      description: 'Audit answer quality, review user ratings, and verify cited source excerpts.',
      icon: <BarChart3 className="w-5 h-5 text-[#96613F]" />
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF7F2] text-[#25211E] overflow-x-hidden selection:bg-[#F3E8DC] selection:text-[#4A3023]">
      
      {/* ================= LEFT SHOWCASE PANEL (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) ================= */}
      <motion.div 
        initial={{ opacity: 0, x: -25 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-3/5 p-8 sm:p-12 lg:p-16 flex-col justify-between"
      >
        <div>
          {/* Top Branding */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#96613F] flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105 duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#4A3023]">Infera AI</span>
              <span className="text-[10px] font-semibold tracking-wide bg-[#F3E8DC] text-[#4A3023] px-2 py-0.5 rounded border border-[#E8DCD1]">
                ENTERPRISE
              </span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DCD1] text-xs font-medium text-[#4A3023] mb-5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#96613F]" />
              <span>Grounded Document Intelligence</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#25211E] leading-tight mb-4"
            >
              AI Knowledge Base for Your Organization
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-[#77716B] leading-relaxed mb-8"
            >
              Centralize internal policies, handbooks, and SOPs into a secure knowledge base. Empower teams to ask questions and receive verifiable answers with page-level source citations.
            </motion.p>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#E8DCD1] rounded-2xl p-4 shadow-xs hover:border-[#96613F]/40 hover:shadow-md transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-center">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-[#25211E]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#77716B] leading-relaxed pl-1">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Compliance Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-6 border-t border-[#E8DCD1] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#77716B] gap-2"
        >
          <span>SOC2 Type II Certified • ISO 27001 Compliant</span>
          <span>Strict Source Grounding Engine v2.4</span>
        </motion.div>
      </motion.div>

      {/* ================= RIGHT AUTHENTICATION CARD (ONLY THIS CARD ON MOBILE) ================= */}
      <div className="w-full lg:w-2/5 min-h-screen p-4 sm:p-8 lg:p-12 flex items-center justify-center bg-[#FAF7F2]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white border border-[#E8DCD1] rounded-[24px] sm:rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm"
        >
          
          {/* Form Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#96613F]">
              Workspace Administration
            </span>
            <h2 className="text-2xl font-bold text-[#25211E] mt-1 tracking-tight">Admin Login</h2>
            <p className="text-xs text-[#77716B] mt-1.5 leading-relaxed">
              Sign in with your administrator credentials to manage documents, permissions, and AI retrieval settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-[#25211E] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#77716B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@infera.ai"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F] transition-all text-[#25211E]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#25211E]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-[#96613F] hover:underline font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#77716B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F] transition-all text-[#25211E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#25211E] transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#E8DCD1] accent-[#96613F] cursor-pointer"
                />
                <span className="text-xs text-[#77716B]">Keep me signed in for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-70 text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* SSO Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-[#E8DCD1] w-full"></div>
            <span className="bg-white px-3 text-[11px] text-[#77716B] absolute select-none">
              Or continue with enterprise SSO
            </span>
          </div>

          {/* Google SSO Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isSsoLoading}
            onClick={handleGoogleSSO}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E8DCD1] bg-white hover:bg-[#FAF7F2] transition-colors text-xs font-semibold text-[#25211E] cursor-pointer"
          >
            {isSsoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#96613F]" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Workspace</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsForgotModalOpen(false);
                setResetSent(false);
                setResetEmail('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white rounded-2xl border border-[#E8DCD1] p-6 shadow-xl relative z-10"
            >
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
                className="absolute right-4 top-4 text-[#77716B] hover:text-[#25211E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#25211E]">Reset Password</h3>
                    <p className="text-xs text-[#77716B] mt-1">
                      Enter your registered work email to receive password reset instructions.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#25211E] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@infera.ai"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#77716B] hover:bg-[#FAF7F2] transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-[#96613F] hover:bg-[#4A3023] text-white transition-colors"
                    >
                      Send Reset Link
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-[#25211E]">Link Dispatched</h3>
                  <p className="text-xs text-[#77716B]">
                    Reset instructions have been sent to: <br />
                    <span className="font-semibold text-[#25211E]">{resetEmail}</span>
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setResetSent(false);
                    }}
                    className="mt-2 w-full py-2 rounded-xl text-xs font-medium bg-[#96613F] text-white"
                  >
                    Back to Sign In
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}