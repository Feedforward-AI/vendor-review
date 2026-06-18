// tooling/slug.js
function slugify(name) {
  return String(name)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents (escaped range)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → hyphen
    .replace(/-{2,}/g, '-')      // collapse runs
    .replace(/^-+|-+$/g, '');    // trim edges
}
module.exports = { slugify };
