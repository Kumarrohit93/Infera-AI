import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm Delete',
  itemName = '',
  description = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#25211E]/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[16px] max-w-sm w-full p-5 sm:p-6 shadow-2xl relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#FDF0EF] border border-[#F3C9C6] text-[#A83833] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#25211E]">
                    {title}
                  </h3>
                  {itemName && (
                    <p className="text-xs font-semibold text-[#96613F] mt-0.5 break-all">
                      "{itemName}"
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel}
                aria-label="Close confirmation"
                className="p-1.5 rounded-lg text-[#77716B] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#77716B] mt-3.5 leading-relaxed">
              {description}
            </p>

            <div className="mt-5 pt-3 border-t border-[#E8DCD1] flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={onCancel}
                className="px-3.5 py-2 rounded-[8px] bg-[#FAF7F2] hover:bg-[#F3E8DC] text-[#25211E] border border-[#E8DCD1] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 rounded-[8px] bg-[#A83833] hover:bg-[#8E2D29] text-white font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}