export function formatShortDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// The seven dates of the week containing `from`, Monday first, to match the
// order the plan is displayed in. Uses local date parts throughout so it agrees
// with getDay() rather than drifting either side of midnight outside UTC.
export function currentWeekDates(from: Date = new Date()): Date[] {
  const jsDay = from.getDay(); // 0 = Sunday
  const offsetToMonday = jsDay === 0 ? -6 : 1 - jsDay;

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offsetToMonday + i);
    return date;
  });
}

// YYYY-MM-DD in the user's own timezone. toISOString() would give the UTC date,
// which disagrees with getDay() either side of midnight outside UTC.
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
