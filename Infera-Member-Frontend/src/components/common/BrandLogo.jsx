import { BrainCircuit } from 'lucide-react'

function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 to-indigo-950 text-white shadow-lg shadow-violet-900/20">
        <BrainCircuit size={22} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-lg font-bold tracking-tight text-slate-900">
          Infera<span className="text-violet-700"> AI</span>
        </p>
        <p className="text-[9px] font-medium uppercase tracking-[2px] text-slate-400">
          Knowledge workspace
        </p>
      </div>
    </div>
  )
}

export default BrandLogo