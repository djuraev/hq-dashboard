import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (msg) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, msg }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm shadow-pop">
            <CheckCircle2 size={18} className="text-good" />
            <span className="font-medium text-ink-800">{t.msg}</span>
            <button onClick={() => remove(t.id)} className="ml-1 text-ink-400 hover:text-ink-700">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
