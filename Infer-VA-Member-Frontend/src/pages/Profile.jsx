import { User, Mail, Shield, Building, Calendar } from "lucide-react";

export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#722F37]">My Profile</h2>
        <p className="text-sm text-gray-600">View your member account details and workspace credentials</p>
      </div>

      <div className="rounded-3xl border border-[#D7A781]/40 bg-white p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5 border-b border-gray-100 pb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#722F37] text-2xl font-bold text-white shadow-md">
            VA
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#722F37]">Vibha Arora</h3>
            <p className="text-sm text-gray-500">Member • Infera AI Workspace</p>
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              ● Active Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F8F4E7] p-4 border border-[#D7A781]/30">
            <Mail className="h-5 w-5 text-[#722F37]" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Email Address</p>
              <p className="text-sm font-bold text-[#722F37]">member@infera.ai</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#F8F4E7] p-4 border border-[#D7A781]/30">
            <Shield className="h-5 w-5 text-[#722F37]" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Access Permission</p>
              <p className="text-sm font-bold text-[#722F37]">Standard Member</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#F8F4E7] p-4 border border-[#D7A781]/30">
            <Building className="h-5 w-5 text-[#722F37]" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Organization</p>
              <p className="text-sm font-bold text-[#722F37]">Infera AI Knowledge Base</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#F8F4E7] p-4 border border-[#D7A781]/30">
            <Calendar className="h-5 w-5 text-[#722F37]" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Member Since</p>
              <p className="text-sm font-bold text-[#722F37]">April 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}