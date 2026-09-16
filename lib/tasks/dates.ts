// API instants must carry a timezone. Inputs and display consistently use UTC.
export function isInstant(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second] = match;
  const y = Number(year), m = Number(month), d = Number(day);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return y >= 1 && m >= 1 && m <= 12 && d >= 1 && d <= days[m - 1] &&
    Number(hour) <= 23 && Number(minute) <= 59 && Number(second ?? 0) <= 59 && Number.isFinite(Date.parse(value));
}

export function utcInput(value: string | null): string {
  return value && isInstant(value) ? new Date(value).toISOString().slice(0, 23) : "";
}

export function inputInstant(value: string): string | null {
  if (!value) return null;
  const instant = `${value}Z`;
  if (!isInstant(instant)) throw new Error("Enter a valid UTC date and time.");
  return new Date(instant).toISOString();
}

export function displayInstant(value: string | null): string {
  if (!value) return "Not set";
  if (!isInstant(value)) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value)) + " UTC";
}
