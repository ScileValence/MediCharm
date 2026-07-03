// src/components/ui/ErrorState.jsx
import { AlertTriangleIcon } from "./icons";

// Errors don't apologize and aren't vague about what happened. Used
// for page-level load failures (distinct from the transient Toast
// used for action results) — this is a persistent state the person
// needs to notice and can act on (usually: retry).
export default function ErrorState({
  title = "Something went wrong",
  body = "We couldn't load this. Please try again.",
  onRetry,
}) {
  return (
    <div className="state-block state-block--error">
      <AlertTriangleIcon className="state-block__icon" aria-hidden="true" />
      <div className="state-block__title">{title}</div>
      <div className="state-block__body">{body}</div>
      {onRetry && (
        <button className="btn btn-outline-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
