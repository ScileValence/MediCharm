// src/utils/formatDoctorName.js

// Doctor names in the database sometimes already include a "Dr."
// prefix (e.g. seed data like "Dr. Arjun Mehta") and sometimes don't
// (e.g. a doctor who self-registers and just types "Arjun Mehta").
// This normalizes both cases to a single consistent "Dr. <name>"
// display string, so callers never need to hardcode "Dr. " themselves
// and risk doubling up to "Dr. Dr. <name>".
export function formatDoctorName(rawName) {
  if (!rawName) return "Doctor";

  const trimmed = rawName.trim();

  // Strip an existing "Dr" / "Dr." / "DR." prefix (with or without
  // the period, any casing, optional extra spaces) before re-adding
  // a single normalized "Dr. " prefix. The \b boundary keeps this
  // from accidentally chopping into names that merely start with the
  // letters "dr", like "Drake".
  const withoutPrefix = trimmed.replace(/^dr\b\.?\s*/i, "");

  return `Dr. ${withoutPrefix}`;
}
