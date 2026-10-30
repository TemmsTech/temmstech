/** Draw a lightweight screen preview from the section's existing content. */
export function drawSectionScreen(
  canvas: HTMLCanvasElement,
  sectionId: string,
) {
  const section = document.getElementById(sectionId);
  const context = canvas.getContext("2d");
  if (!section || !context) return;
  const style = getComputedStyle(section);
  const width = canvas.width;
  const padding = width * 0.075;
  let y = padding;
  context.fillStyle = style.getPropertyValue("--background").trim();
  context.fillRect(0, 0, width, canvas.height);
  context.fillStyle = style.getPropertyValue("--foreground").trim();
  function text(value: string, size: number, weight = "400") {
    if (!context) return;
    context.font = `${weight} ${size}px Arial, sans-serif`;
    context.textBaseline = "top";
    let line = "";
    for (const word of value.trim().split(/\s+/)) {
      const next = line ? `${line} ${word}` : word;
      if (line && context.measureText(next).width > width - padding * 2) {
        context.fillText(line, padding, y);
        y += size * 1.3;
        line = word;
      } else line = next;
    }
    context.fillText(line, padding, y);
    y += size * 1.3;
  }
  const heading = section.querySelector("h2");
  const intro = heading
    ?.closest(".section-space")
    ?.querySelector(".max-w-2xl.text-base");
  text(section.querySelector(".eyebrow")?.textContent ?? "", width * 0.021);
  y += padding;
  text(heading?.textContent ?? "", width * 0.075, "500");
  y += padding * 0.7;
  context.fillStyle = style.getPropertyValue("--muted-foreground").trim();
  text(intro?.textContent ?? "", width * 0.033);
  for (const title of section.querySelectorAll("h3")) {
    y += padding;
    if (y > canvas.height - padding) break;
    context.fillStyle = style.getPropertyValue("--border").trim();
    context.fillRect(padding, y, width - padding * 2, 1);
    y += padding * 0.55;
    context.fillStyle = style.getPropertyValue("--foreground").trim();
    text(title.textContent ?? "", width * 0.04, "600");
  }
}
