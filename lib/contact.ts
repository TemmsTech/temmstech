/**
 * Nearest place to start a brief. The homepage has its own contact section, so
 * stay there and scroll; every other page goes to the contact page. The
 * `#contact` hash makes BriefReveal open the form on arrival.
 */
export function contactHref(pathname: string) {
  return pathname === "/" ? "/#contact" : "/contact#contact";
}
