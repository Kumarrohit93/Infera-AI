import { motion } from 'framer-motion'
import {
  Rocket,
  ThumbsUp,
  Cloud,
  Clock,
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
  Folder,
  MessageSquare,
  Users,
} from 'lucide-react'

function Float({ children, className = '', delay = 0, distance = 10 }) {
  return (
    <motion.div
      animate={{ y: [0, -distance, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
      className={`absolute ${className}`}
    >
      {children}
    </motion.div>
  )
}

function IconBadge({ icon: Icon, color = 'text-violet-700', ring = 'ring-violet-200' }) {
  return (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-4 ${ring}`}
    >
      <Icon size={20} className={color} />
    </div>
  )
}

function AuthVisual() {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-100 lg:flex lg:w-[55%] lg:flex-col lg:items-center lg:justify-center">
      {/* Background shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="relative h-[430px] w-full max-w-[560px]"
      >
        {/* Laptop */}
        <div className="absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-[48%]">
          <div className="overflow-hidden rounded-t-2xl border-[6px] border-slate-800 bg-white shadow-2xl shadow-violet-900/20">
            {/* Window bar */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-red-300" />
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              <span className="h-2 w-2 rounded-full bg-green-300" />
              <span className="ml-3 h-3 w-32 rounded bg-slate-200/70" />
            </div>

            <div className="flex h-[210px]">
              {/* Sidebar */}
              <div className="flex w-12 flex-col items-center gap-3 border-r border-slate-100 bg-slate-50 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-700 text-white">
                  <Sparkles size={13} />
                </span>
                <Folder size={14} className="text-slate-400" />
                <MessageSquare size={14} className="text-slate-400" />
                <Users size={14} className="text-slate-400" />
              </div>

              {/* Main */}
              <div className="flex-1 space-y-3 p-4">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] text-slate-500">
                  <Search size={12} className="text-violet-700" />
                  How do I onboard a new client?
                </div>

                <div className="rounded-xl bg-violet-50 p-3">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold text-violet-800">
                    <Sparkles size={11} /> Infera AI
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded bg-violet-200" />
                    <div className="h-1.5 w-11/12 rounded bg-violet-200" />
                    <div className="h-1.5 w-2/3 rounded bg-violet-200" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] text-slate-600">
                    <FileText size={10} /> Onboarding.pdf
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[9px] text-slate-600">
                    <FileText size={10} /> Client-Guide.docx
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop base */}
          <div className="relative -mx-[6%] h-3.5 rounded-b-2xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-xl">
            <div className="absolute left-1/2 top-0 h-1.5 w-20 -translate-x-1/2 rounded-b-lg bg-slate-500/50" />
          </div>
        </div>

        {/* Floating: document card (top-left) */}
        <Float className="left-0 top-4 sm:left-2" delay={0} distance={8}>
          <div className="w-44 rounded-xl bg-white p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                <FileText size={16} />
              </span>
              <div className="space-y-1">
                <div className="h-1.5 w-16 rounded bg-slate-200" />
                <div className="h-1.5 w-10 rounded bg-slate-100" />
              </div>
            </div>
            <div className="rounded-md bg-violet-700 py-1 text-center text-[10px] font-semibold text-white">
              Upload document
            </div>
          </div>
        </Float>

        {/* Floating: icon badges */}
        <Float className="right-16 top-0" delay={0.6} distance={12}>
          <IconBadge icon={Rocket} />
        </Float>
        <Float className="left-2 top-[52%]" delay={1.1} distance={10}>
          <IconBadge icon={ThumbsUp} color="text-sky-600" ring="ring-sky-200" />
        </Float>
        <Float className="right-2 top-[44%]" delay={0.3} distance={10}>
          <IconBadge icon={Cloud} color="text-indigo-600" ring="ring-indigo-200" />
        </Float>
        <Float className="bottom-6 left-14" delay={0.9} distance={9}>
          <IconBadge icon={Clock} color="text-emerald-600" ring="ring-emerald-200" />
        </Float>

        {/* Floating: source card (bottom-right) */}
        <Float className="bottom-2 right-0 sm:right-2" delay={0.4} distance={8}>
          <div className="flex w-48 items-center gap-2.5 rounded-xl bg-white p-3 shadow-xl">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <div>
              <p className="text-[10px] font-semibold text-slate-700">Source verified</p>
              <p className="text-[9px] text-slate-400">Billing-Policy.pdf · Page 4</p>
            </div>
          </div>
        </Float>
      </motion.div>

      {/* Caption */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 mt-2 max-w-md px-6 text-center"
      >
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Your team's knowledge, instantly searchable.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Infera AI turns scattered documents into clear, sourced answers.
        </p>
      </motion.div>
    </aside>
  )
}

export default AuthVisual