// src/hooks/use-toast.js
import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const toast = useCallback(({ title, description, variant }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);

    // Remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Toast component rendering
  const ToastContainer = () => (
    <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={`p-3 rounded shadow-md text-white ${
            variant === "destructive"
              ? "bg-red-600"
              : variant === "success"
              ? "bg-green-600"
              : "bg-gray-800"
          }`}
        >
          <strong>{title}</strong>
          {description && <div className="text-sm">{description}</div>}
        </div>
      ))}
    </div>
  );

  return { toast, ToastContainer };
}
