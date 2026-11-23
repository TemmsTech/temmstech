/** How a page address is shown, read and checked, shared by every simulated browser window. */

/** What the address bar shows for a page: the host and path, without the scheme. */
export function addressOf(url: string) {
  if (!url) return "";
  const { host, pathname, search, hash } = new URL(url);
  const path = pathname === "/" && !search && !hash ? "" : pathname;
  return `${host}${path}${search}${hash}`;
}

/** The site's name for a tab: its host without a leading "www.". */
export function labelOf(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * Turns what a visitor typed into a page address, or undefined when it is not
 * a web link. Only http and https links to a named site are accepted; http is
 * upgraded to https (an https page cannot frame an http one), and anything
 * else (javascript:, data:, file:, bare words, IP addresses, links with a
 * login in them) is refused.
 */
export function parseAddress(input: string) {
  const text = input.trim();
  if (!text || text.length > 2048 || /\s/.test(text)) return undefined;
  const explicit = /^https?:\/\//i.test(text);
  if (!explicit && /^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return undefined;
  let url: URL;
  try {
    url = new URL(explicit ? text : `https://${text}`);
  } catch {
    return undefined;
  }
  if (url.username || url.password) return undefined;
  const named =
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/i;
  if (!named.test(url.hostname)) return undefined;
  url.protocol = "https:";
  return url.href;
}
