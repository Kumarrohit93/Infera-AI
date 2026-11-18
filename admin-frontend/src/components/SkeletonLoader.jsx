
export function TableSkeleton({ rows = 4, columns = 5 }) {
  return (
    <div className="overflow-x-auto animate-pulse">
      <div className="bg-[#FAF7F2] border-b border-[#E8DCD1] px-4 py-3 flex items-center gap-4">
        {Array.from({ length: columns }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 rounded bg-[#E8DCD1]/80 flex-1 max-w-[120px]"
          />
        ))}
      </div>

      <div className="divide-y divide-[#E8DCD1]">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="px-4 py-3.5 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1 min-w-[180px]">
              <div className="w-9 h-9 rounded-full bg-[#F3E8DC] shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-32 rounded bg-[#F3E8DC]" />
                <div className="h-2.5 w-44 rounded bg-[#FAF7F2]" />
              </div>
            </div>

            {Array.from({ length: Math.max(1, columns - 2) }).map((_, colIdx) => (
              <div
                key={colIdx}
                className="hidden sm:block h-4 rounded-full bg-[#F3E8DC]/75 flex-1 max-w-[100px]"
              />
            ))}

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2]" />
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FolderGridSkeleton({ cards = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
      {Array.from({ length: cards }).map((_, idx) => (
        <div
          key={idx}
          className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] p-5 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[12px] bg-[#F3E8DC] shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-28 rounded bg-[#F3E8DC]" />
                <div className="h-3 w-16 rounded bg-[#FAF7F2]" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2]" />
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F2]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full rounded bg-[#FAF7F2]" />
            <div className="h-3 w-2/3 rounded bg-[#FAF7F2]" />
          </div>

          <div className="pt-3 border-t border-[#F3E8DC]/80 space-y-2">
            <div className="flex justify-between">
              <div className="h-2.5 w-20 rounded bg-[#FAF7F2]" />
              <div className="h-2.5 w-16 rounded bg-[#F3E8DC]" />
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#E8DCD1]" />
          </div>

          <div className="pt-3 border-t border-[#F3E8DC] flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-[#F3E8DC]" />
            <div className="h-3 w-20 rounded bg-[#FAF7F2]" />
          </div>
        </div>
      ))}
    </div>
  );
}