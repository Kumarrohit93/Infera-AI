export default function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D7A781]/30 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button for Mobile */}
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#722F37]/10 text-[#722F37] transition hover:bg-[#722F37] hover:text-white lg:hidden"
          aria-label="Toggle Menu"
        >
          <span className="text-xl font-bold">☰</span>
        </button>
        <span className="text-sm font-semibold text-[#722F37]">Member Portal</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#722F37] text-xs sm:text-sm font-bold text-white shadow-sm">
            VA
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#722F37]">Vibha Arora</p>
            <p className="text-[11px] text-gray-500">vibha@infera.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
}