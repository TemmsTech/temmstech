import { expect, test } from "@playwright/test";

test("the laptop's Chrome window opens from its desktop icon, switches between two tabs, and its taskbar button comes and goes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-chrome").first();
  const app = page.locator(".screen-chrome").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  // Closed: no taskbar button. The Chrome desktop icon (two quick clicks) opens it.
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  const icon = page.locator('.screen-desktop-icon[aria-label="Google Chrome"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // Two tabs; the first is the SlipDesk page. Pressing a tab shows its page and address.
  await expect(app.locator(".ch-tab")).toHaveCount(2);
  await expect(app.locator(".ch-url-text")).toContainText("SlipDesk/slip-desk.html");
  await press('[data-tab="claude"]');
  await expect(app.locator('.ch-pane[data-pane="claude"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".ch-url-text")).toContainText("claude.ai/chat/");
  await expect(app.locator(".ch-pane[data-on]")).toHaveCount(1);

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
  await expect(app.locator(".ch-url-text")).toContainText("claude.ai/chat/");

  // Closing resets it to the first tab and takes the taskbar button away.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  await expect(app.locator(".ch-url-text")).toContainText("SlipDesk/slip-desk.html", {
    timeout: 5000,
  });
});
