// src/hooks/useToast.js
import { useState, useCallback } from "react";

// Pairs with components/Toast.jsx. Returns { toast, showToast,
// clearToast } — showToast("message") defaults to a success-styled
// toast, showToast("message", "error") shows an error-styled one.
export default function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
