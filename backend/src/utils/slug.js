const slugify = require('slugify');

const generateSlug = (text) => {
  return slugify(text, { lower: true, strict: true });
};

const uniqueSlug = async (text, model, field = 'slug', existingId = null) => {
  let slug = generateSlug(text);
  let counter = 1;
  let unique = false;

  while (!unique) {
    const where = { [field]: slug };
    if (existingId) {
      where.id = { not: existingId };
    }
    const existing = await model.findFirst({ where });
    if (!existing) {
      unique = true;
    } else {
      slug = `${generateSlug(text)}-${counter}`;
      counter++;
    }
  }

  return slug;
};

module.exports = { generateSlug, uniqueSlug };
