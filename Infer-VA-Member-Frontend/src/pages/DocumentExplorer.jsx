export default function DocumentExplorer() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#722F37]">Document Explorer</h1>
          <p className="text-sm text-gray-500">Browse folders and documents you have permission to access.</p>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-[#D7A781]/30 bg-white/90 p-8 text-center shadow-sm">
        <span className="text-4xl mb-3">📁</span>
        <h3 className="text-lg font-bold text-[#722F37]">No Documents Available</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-sm">
          There are currently no documents or folders assigned to your account.
        </p>
      </div>
    </div>
  );
}