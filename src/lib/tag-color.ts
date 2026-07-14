export interface TagStyle {
  color: string;
  border: string;
  bg: string;
}

// Same 4 colors the app always used for Signature/Vegetarian/Seafood/Best
// Seller, plus 2 more — tags are free-form per restaurant now, so a tag no
// longer maps to a fixed meaning, just a color cycled by a hash of its text.
const PALETTE: TagStyle[] = [
  { color: "#D8B872", border: "rgba(201,165,106,.45)", bg: "rgba(201,165,106,.08)" },
  { color: "#8FCC9A", border: "rgba(124,196,138,.4)", bg: "rgba(124,196,138,.08)" },
  { color: "#8FB8D4", border: "rgba(127,174,201,.4)", bg: "rgba(127,174,201,.08)" },
  { color: "#E4DDD0", border: "rgba(228,221,208,.35)", bg: "rgba(228,221,208,.07)" },
  { color: "#D48F8F", border: "rgba(212,143,143,.4)", bg: "rgba(212,143,143,.08)" },
  { color: "#B79AD6", border: "rgba(183,154,214,.4)", bg: "rgba(183,154,214,.08)" },
];

export function tagStyle(tag: string): TagStyle {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
