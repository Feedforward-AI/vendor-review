// tooling/md.js
// Dev-only helper: split a markdown file's leading YAML frontmatter from its body.
function splitFrontmatter(text) {
  const m = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: String(text) };
  return { frontmatter: m[1], body: m[2] };
}
module.exports = { splitFrontmatter };
