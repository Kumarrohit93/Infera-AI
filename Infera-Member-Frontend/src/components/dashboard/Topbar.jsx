import { Bell, Menu, Search } from 'lucide-react'

function Topbar({ onMenuClick }) {
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-[#E9E6F5] bg-white px-5 sm:px-8">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-[#E8E5F0] p-2.5 text-[#687189] hover:bg-[#F7F5FB] lg:hidden"
        >
          <Menu size={19} />
        </button>

        <div className="relative hidden w-72 sm:block lg:w-96">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A7B8]"
          />

          <input
            type="text"
            placeholder="Search documents..."
            className="h-11 w-full rounded-xl border border-[#E5E2EC] bg-[#FAFAFC] pl-11 pr-4 text-sm text-[#20283B] outline-none transition placeholder:text-[#A0A7B8] focus:border-[#B78AEF] focus:bg-white focus:ring-4 focus:ring-[#6D16D9]/5"
          />
        </div>

        <div className="sm:hidden">
          <h2 className="text-lg font-bold text-[#10172A]">Infera-AI</h2>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button className="relative rounded-xl p-2.5 text-[#687189] transition hover:bg-[#F7F5FB] hover:text-[#6D16D9]">
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#6D16D9]" />
        </button>

        <div className="hidden h-8 w-px bg-[#E9E6F0] sm:block" />

        <button className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#F7F5FB]">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEE3FF] text-sm font-bold text-[#6515C9]">
            K
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#20283B]">
              Khushi
            </p>

            <p className="text-[11px] text-[#8C94A8]">
              Member
            </p>
          </div>
        </button>
      </div>
    </header>
  )
}

export default Topbar