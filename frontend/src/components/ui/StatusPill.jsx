// src/components/ui/StatusPill.jsx
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  InfoIcon,
} from "./icons";

// Single source of truth for every status string used across the
// app — appointment statuses (PENDING/CONFIRMED/COMPLETED/CANCELLED/
// REJECTED), doctor statuses (PENDING/APPROVED/REJECTED/SUSPENDED),
// and order statuses (PLACED/CANCELLED). Mapped once here instead of
// each page inventing its own bg-warning/bg-success guesswork, so
// the same word always means the same color everywhere in the app.
const STATUS_CONFIG = {
  PENDING:    { tone: "pending",   label: "Pending",   Icon: ClockIcon },
  CONFIRMED:  { tone: "confirmed", label: "Confirmed",  Icon: CheckCircleIcon },
  APPROVED:   { tone: "confirmed", label: "Approved",   Icon: CheckCircleIcon },
  COMPLETED:  { tone: "info",      label: "Completed",  Icon: CheckCircleIcon },
  PLACED:     { tone: "info",      label: "Placed",     Icon: InfoIcon },
  CANCELLED:  { tone: "cancelled", label: "Cancelled",  Icon: XCircleIcon },
  REJECTED:   { tone: "cancelled", label: "Rejected",   Icon: XCircleIcon },
  SUSPENDED:  { tone: "cancelled", label: "Suspended",  Icon: XCircleIcon },
};

export default function StatusPill({ status, className = "" }) {
  const key = (status || "").toUpperCase();
  const config = STATUS_CONFIG[key] || {
    tone: "neutral",
    label: status || "Unknown",
    Icon: InfoIcon,
  };

  const { tone, label, Icon } = config;

  return (
    <span className={`status-pill status-pill--${tone} ${className}`}>
      <Icon aria-hidden="true" />
      {label}
    </span>
  );
}

// Maps the same status vocabulary to the .status-card--* left-edge
// bar tone, for callers that wrap a whole card (not just a pill).
export function statusCardTone(status) {
  const key = (status || "").toUpperCase();
  return (STATUS_CONFIG[key]?.tone) || "neutral";
}
