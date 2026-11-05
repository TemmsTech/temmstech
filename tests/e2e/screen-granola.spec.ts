import { expect, test } from "@playwright/test";

test("the laptop's Granola window opens from its taskbar button and its desktop icon, and types a question", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-granola").first();
  const app = page.locator(".screen-granola").first();
  const press = (selector: string) =>
    app.locator(selector).evaluate((el) => (el as HTMLElement).click());

  await expect(app).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The question types itself into the "Ask anything" box.
  await expect(app.locator(".gr-typed")).toContainText("client kickoff", { timeout: 20000 });

  // The middle button toggles windowed and full.
  await press('.gr-control[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await press('.gr-control[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button; the button brings it back.
  await press('.gr-control[data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");

  // Closing starts it over; the Granola desktop icon (two quick clicks) opens it again.
  await press('.gr-control[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("data-state", "closed");
  await expect(app.locator(".gr-typed")).toHaveText("", { timeout: 5000 });
  const icon = page.locator('.screen-desktop-icon[aria-label="Granola"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
});
