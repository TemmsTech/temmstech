export function observeSectionNavigation(
  sectionId: string,
  onNavigate: () => void,
) {
  const hash = `#${sectionId}`;
  const onHashChange = () => {
    if (location.hash === hash) onNavigate();
  };
  const onClick = (event: MouseEvent) => {
    const anchor =
      event.target instanceof Element ? event.target.closest("a") : null;
    if (
      !anchor ||
      anchor.target === "_blank" ||
      event.button !== 0 ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const url = new URL(anchor.href);
    if (
      url.origin === location.origin &&
      url.pathname === location.pathname &&
      url.hash === hash
    )
      onNavigate();
  };
  window.addEventListener("hashchange", onHashChange);
  document.addEventListener("click", onClick);
  return () => {
    window.removeEventListener("hashchange", onHashChange);
    document.removeEventListener("click", onClick);
  };
}
