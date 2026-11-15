import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'

function BrandLogo({ compact = false }) {
  return (
    <div className="flex items-center">
      {/* Logo image: load, collapse aur expand par pop animation */}
      <motion.div
        key={compact ? 'compact' : 'full'}
        initial={{ scale: 0.6, rotate: compact ? -20 : 20, opacity: 0.4 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        whileHover={{ rotate: 8, scale: 1.06 }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 to-indigo-950 text-white shadow-lg shadow-violet-900/20"
      >
        <BrainCircuit size={22} strokeWidth={1.8} />
      </motion.div>

      {/* Naam: page load par bhi slide + fade, collapse par chhupta hai */}
      <motion.div
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: compact ? 0 : 1, x: compact ? -10 : 0 }}
        transition={{
          duration: 0.35,
          delay: compact ? 0 : 0.15,
          ease: 'easeOut',
        }}
        className="ml-2.5 whitespace-nowrap"
      >
        <p className="text-lg font-bold leading-tight tracking-tight text-slate-900">
          Infera<span className="text-violet-700"> AI</span>
        </p>
        <p className="text-[9px] font-medium uppercase tracking-[2px] text-slate-400">
          Knowledge workspace
        </p>
      </motion.div>
    </div>
  )
}

export default BrandLogo