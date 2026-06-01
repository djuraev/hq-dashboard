import { X } from "lucide-react";
import { useEscape, useFocusTrap, useScrollLock } from "../lib/a11y";

export default function Modal({ open, onClose, title, children, footer }) {
  useEscape(open, onClose);
  useScrollLock(open);
  const ref = useFocusTrap(open);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-pop dark:bg-ink-800"
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-50 hover:text-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
