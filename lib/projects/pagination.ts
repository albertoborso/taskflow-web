export type SearchParams = Record<string, string | string[] | undefined>;

export function projectPagination(params: SearchParams) {
  function integer(value: string | string[] | undefined, fallback: number, min: number, max: number) {
    if (typeof value !== "string" || !/^\d+$/.test(value)) return fallback;
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
  }
  return {
    limit: integer(params.limit, 20, 1, 100),
    offset: integer(params.offset, 0, 0, Number.MAX_SAFE_INTEGER - 100),
  };
}

export function dashboardHref(params: SearchParams, limit: number, offset: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach(item => query.append(key, item));
    else if (value !== undefined) query.set(key, value);
  }
  query.set("limit", String(limit));
  query.set("offset", String(offset));
  return `/dashboard?${query}`;
}
