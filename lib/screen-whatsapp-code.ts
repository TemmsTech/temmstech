/** A tiny JavaScript highlighter for the simulated Meta AI chat's code blocks. */
const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|var|for|of|in|while|do|if|else|return|function|break|continue|new|true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)(?=\()/g;

const esc = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function highlightJs(code: string) {
  let out = "";
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    out += esc(code.slice(last, match.index));
    const kind = match[1] ? "c" : match[2] ? "s" : match[3] ? "k" : match[4] ? "n" : "f";
    out += `<span class="wa-tok-${kind}">${esc(match[0])}</span>`;
    last = match.index + match[0].length;
  }
  return out + esc(code.slice(last));
}
