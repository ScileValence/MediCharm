// src/components/Toast.jsx
import { useEffect } from "react";

// A small, self-contained replacement for window.alert() — renders a
// dismissible, auto-expiring banner instead of a blocking native
// dialog. Used wherever a page needs to report the result of an
// action (success or failure) without halting interaction.
//
// Usage:
//   const [toast, setToast] = useState(null);
//   setToast({ type: "success", message: "Doctor approved" });
//   setToast({ type: "error", message: "Failed to delete order" });
//   <Toast toast={toast} onClose={() => setToast(null)} />

const VARIANT_CLASSES = {
  success: "alert-success",
  error: "alert-danger",
  info: "alert-info",
};

export default function Toast({ toast, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const variantClass = VARIANT_CLASSES[toast.type] || VARIANT_CLASSES.info;

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1080 }}
    >
      <div
        className={`alert ${variantClass} shadow-sm d-flex align-items-center justify-content-between gap-3 mb-0`}
        role="alert"
      >
        <span>{toast.message}</span>
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}
