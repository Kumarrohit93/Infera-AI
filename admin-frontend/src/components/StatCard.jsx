import React from 'react';

export default function StatCard({ title, value, subtitle, trend, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#FFFFFF] border border-[#E8DCD1] rounded-[12px] p-5 shadow-sm transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-[#96613F] hover:shadow' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#77716B]">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-[#25211E] mt-1.5">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-[10px] bg-[#F3E8DC] border border-[#E8DCD1] flex items-center justify-center text-[#96613F] shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-[#F3E8DC] flex items-center justify-between text-xs">
          {trend && (
            <span className="font-semibold text-[#96613F] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E8DCD1]">
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[#77716B] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}