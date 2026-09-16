import slugify from "slugify";

/**
 * Builds a unique slug for `Model` derived from `text`, appending
 * -2, -3, ... only if needed to avoid colliding with an existing
 * document. `excludeId` lets an update skip colliding with itself.
 */
export const generateUniqueSlug = async (Model, text, excludeId = null) => {
  const base = slugify(text, { lower: true, strict: true });
  let slug = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const filter = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    // eslint-disable-next-line no-await-in-loop
    const existing = await Model.findOne(filter).select("_id");
    if (!existing) return slug;

    slug = `${base}-${counter}`;
    counter += 1;
  }
};
