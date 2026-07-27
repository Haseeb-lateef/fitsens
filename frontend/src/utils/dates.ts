export function formatShortDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// YYYY-MM-DD in the user's own timezone. toISOString() would give the UTC date,
// which disagrees with getDay() either side of midnight outside UTC.
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
