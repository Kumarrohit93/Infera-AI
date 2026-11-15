export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#722F37]">Account Settings</h1>
        <p className="text-sm text-gray-500">Manage your member profile and preferences.</p>
      </div>

      <div className="rounded-3xl border border-[#D7A781]/30 bg-white/90 p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#722F37]">Profile Information</h3>
          <p className="text-xs text-gray-500">Your account details linked with the organization.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#722F37] mb-1">Full Name</label>
            <input
              type="text"
              disabled
              value="Team Member"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#722F37] mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value="member@infera.ai"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}