export function createSectionPreview(source: HTMLElement) {
  const copy = source.cloneNode(true);
  if (!(copy instanceof HTMLElement))
    throw new Error("Section preview unavailable");
  for (const element of [
    copy,
    ...copy.querySelectorAll("[id], [aria-labelledby]"),
  ]) {
    element.removeAttribute("id");
    element.removeAttribute("aria-labelledby");
  }
  copy.inert = true;
  copy.setAttribute("aria-hidden", "true");
  return copy;
}
