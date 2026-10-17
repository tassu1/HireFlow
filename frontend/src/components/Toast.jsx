import { createContext, useCallback, useContext, useState } from "react";
import Icon from "./Icons.jsx";

const ToastContext = createContext(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((kind, message) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, kind, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`}>
            <Icon name={t.kind === "success" ? "check" : "xcircle"} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
