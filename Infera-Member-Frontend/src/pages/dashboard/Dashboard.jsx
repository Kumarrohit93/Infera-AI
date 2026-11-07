import { useState } from 'react'
import {
  FileText,
  MessageSquare,
  Database,
} from 'lucide-react'

import Sidebar from '../../components/dashboard/Sidebar'
import Topbar from '../../components/dashboard/Topbar'

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#20283B]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="min-w-0 flex-1">

          {/* Topbar */}
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

        </div>
      </div>
    </div>
  )
}

export default Dashboard