import { expect, test } from "@playwright/test";

test("the laptop's Brave window opens from its taskbar button and its desktop icon, and switches between three tabs", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-brave").first();
  const app = page.locator(".screen-brave").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  await expect(app).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // Three tabs; the first is this site. Pressing a tab shows its page and address.
  await expect(app.locator(".br-tab")).toHaveCount(3);
  await expect(app.locator(".br-url-text")).toHaveText("localhost:3000");
  await press('[data-tab="claude"]');
  await expect(app.locator('.br-pane[data-pane="claude"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".br-url-text")).toContainText("claude.ai/chat/");
  await press('[data-tab="chatgpt"]');
  await expect(app.locator('.br-pane[data-pane="chatgpt"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".br-url-text")).toContainText("chatgpt.com/c/");
  await expect(app.locator(".br-pane[data-on]")).toHaveCount(1);

  // The middle button toggles windowed and full.
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button, keeps the tab, and the button brings it back.
  await press('[data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(app.locator(".br-url-text")).toContainText("chatgpt.com/c/");

  // Closing resets it to the first tab; the Brave desktop icon (two quick clicks) opens it again.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("data-state", "closed");
  await expect(app.locator(".br-url-text")).toHaveText("localhost:3000", { timeout: 5000 });
  const icon = page.locator('.screen-desktop-icon[aria-label="Brave"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
});
