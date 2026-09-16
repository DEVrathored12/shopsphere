const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses ?page & ?limit query params into safe, bounded numbers and
 * returns the Mongo skip/limit pair plus the values used (so the
 * response can echo back accurate pagination metadata).
 */
export const parsePagination = (query = {}) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildPaginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), total === 0 ? 0 : 1),
});

/**
 * Parses a `?sort=field:asc|desc,field2:asc` string into a Mongoose
 * sort object, restricted to an allow-list of fields so callers can
 * never sort on arbitrary/sensitive fields.
 *
 * Falls back to `defaultSort` when nothing valid was provided.
 */
export const parseSort = (sortQuery, allowedFields = [], defaultSort = { createdAt: -1 }) => {
  if (!sortQuery || typeof sortQuery !== "string") return defaultSort;

  const sort = {};
  const parts = sortQuery.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const [field, direction] = part.split(":").map((p) => p && p.trim());
    if (!field || !allowedFields.includes(field)) continue;
    sort[field] = direction === "desc" ? -1 : 1;
  }

  return Object.keys(sort).length > 0 ? sort : defaultSort;
};

/**
 * Escapes a string for safe use inside a RegExp constructor, so
 * user-supplied search text can't be used to build an expensive or
 * malicious regular expression.
 */
export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
