// src/components/ui/EmptyState.jsx
import { InboxIcon } from "./icons";

// An empty screen is an invitation to act, not a blank table. Used
// anywhere a list/table could legitimately have zero rows (no
// appointments yet, no orders yet, no doctors yet, etc.) instead of
// a bare "No data found" line.
export default function EmptyState({
  icon,
  title = "Nothing here yet",
  body,
  action,
}) {
  const Icon = icon || InboxIcon;

  return (
    <div className="state-block">
      <Icon className="state-block__icon" aria-hidden="true" />
      <div className="state-block__title">{title}</div>
      {body && <div className="state-block__body">{body}</div>}
      {action}
    </div>
  );
}
