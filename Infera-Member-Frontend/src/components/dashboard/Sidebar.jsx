import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  Settings,
  LogOut,
  X,
  ChevronsLeft,
} from 'lucide-react'
import BrandLogo from '../common/BrandLogo'


const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Documents', icon: FileText },
  { label: 'AI Chat', icon: MessageSquare, badge: 'AI' },
  { label: 'History', icon: History },
]

const spring = { type: 'spring', stiffness: 300, damping: 32 }

function NavButton({
  label,
  icon: Icon,
  badge,
  active,
  collapsed,
  onClick,
  index = 0,
  pillId,
  danger = false,
}) {
  // Labels ek ke baad ek aate hain (stagger), band hote waqt ek saath jaate hain
  const labelTransition = {
    duration: 0.22,
    ease: 'easeOut',
    delay: collapsed ? 0 : 0.08 + index * 0.03,
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="group relative"
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        title={label}
        className={`relative flex h-11 w-full items-center overflow-hidden rounded-xl pr-3 text-sm font-medium transition-colors duration-200 ${
          active
            ? 'text-[#6515C9]'
            : danger
            ? 'text-[#687189] hover:bg-red-50 hover:text-red-500'
            : 'text-[#687189] hover:bg-[#F7F5FB] hover:text-[#242B40]'
        }`}
      >
        {/* Sliding active pill */}
        {active && pillId && (
          <motion.span
            layoutId={pillId}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className="absolute inset-0 rounded-xl bg-[#F1E8FF]"
          >
            <span className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-[#6D16D9]" />
          </motion.span>
        )}

        {/* Fixed icon column: icon kabhi apni jagah se hilta nahi */}
        <span className="relative z-10 flex h-11 w-12 shrink-0 items-center justify-center">
          <Icon
            size={18}
            strokeWidth={active ? 2.2 : 1.8}
            className={`transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${
              active ? 'text-[#6D16D9]' : danger ? '' : 'text-[#8D95AA]'
            }`}
          />
        </span>

        {/* Label: hamesha rendered, sirf fade + slide */}
        <motion.span
          initial={false}
          animate={{ opacity: collapsed ? 0 : 1, x: collapsed ? -10 : 0 }}
          transition={labelTransition}
          className="relative z-10 whitespace-nowrap"
        >
          {label}
        </motion.span>

        {badge && (
          <motion.span
            initial={false}
            animate={{
              opacity: collapsed ? 0 : 1,
              scale: collapsed ? 0.7 : 1,
            }}
            transition={labelTransition}
            className="relative z-10 ml-auto rounded-full bg-[#F1E8FF] px-2 py-0.5 text-[9px] font-semibold text-[#6D16D9] ring-1 ring-[#E4D3FB]"
          >
            {badge}
          </motion.span>
        )}
      </motion.button>

      {/* Tooltip (button ke bahar, taaki clip na ho) */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 lg:block">
          {label}
        </span>
      )}
    </motion.div>
  )
}

function Sidebar({ isOpen, onClose, activeItem, onNavigate, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [internalActive, setInternalActive] = useState('Dashboard')

  const active = activeItem ?? internalActive

  const go = (label) => {
    setInternalActive(label)
    onNavigate?.(label)
    onClose?.()
  }

  // Ctrl + B se toggle
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setCollapsed((c) => !c)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Width animate hoti hai. Collapsed 80px = icon center exactly beech mein */}
        <motion.div
          initial={false}
          animate={{ width: collapsed ? 80 : 256 }}
          transition={spring}
          className="relative h-full border-r border-[#E9E6F5] bg-white shadow-[4px_0_24px_rgba(80,55,140,0.04)] lg:shadow-none"
        >
          {/* Collapse / Expand button */}
          <motion.button
            onClick={() => setCollapsed((c) => !c)}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand (Ctrl + B)' : 'Collapse (Ctrl + B)'}
            className="absolute -right-3.5 top-[26px] z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-[#E9E6F5] bg-white text-[#8991A8] shadow-md transition-colors hover:border-[#D9C7F5] hover:bg-[#F1E8FF] hover:text-[#6D16D9] lg:flex"
          >
            <motion.span
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex"
            >
              <ChevronsLeft size={15} />
            </motion.span>
          </motion.button>

          {/* Content: padding hamesha same, overflow clip */}
          <div className="flex h-full flex-col overflow-hidden px-4 py-5">
            {/* Logo */}
            <div className="flex h-11 items-center justify-between">
              <div className="pl-1">
                <BrandLogo compact={collapsed} />
              </div>

              <button
                onClick={onClose}
                aria-label="Close sidebar"
                className="rounded-lg p-2 text-[#8991A8] transition hover:bg-[#F5F3FA] lg:hidden"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="mt-10 space-y-1.5">
              {navigationItems.map((item, index) => (
                <NavButton
                  key={item.label}
                  {...item}
                  index={index}
                  pillId="nav-pill"
                  active={active === item.label}
                  collapsed={collapsed}
                  onClick={() => go(item.label)}
                />
              ))}
            </nav>

            {/* Bottom */}
            <div className="mt-auto space-y-1.5 border-t border-[#F0EDF6] pt-4">
              <NavButton
                label="Settings"
                icon={Settings}
                index={5}
                pillId="bottom-pill"
                active={active === 'Settings'}
                collapsed={collapsed}
                onClick={() => go('Settings')}
              />
              <NavButton
                label="Logout"
                icon={LogOut}
                index={6}
                danger
                collapsed={collapsed}
                onClick={onLogout}
              />
            </div>
          </div>
        </motion.div>
      </aside>
    </>
  )
}

export default Sidebar