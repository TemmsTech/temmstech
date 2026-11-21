import { expect, test } from "@playwright/test";

test("the laptop's Microsoft Edge desktop icon opens the browser window, and brings it forward when another window covers it", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".device-stage").first()).toHaveAttribute(
    "data-renderer",
    "ready",
    { timeout: 30000 },
  );

  const browser = page.locator(".screen-browser").first();
  const icon = page.locator('.screen-desktop-icon[aria-label="Microsoft Edge"]').first();
  const press = (selector: string) =>
    page.locator(selector).first().evaluate((el) => (el as HTMLElement).click());
  const open = async () => {
    await icon.evaluate((el) => (el as HTMLElement).click());
    await icon.evaluate((el) => (el as HTMLElement).click());
  };

  // One click only selects it.
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(icon).toHaveAttribute("data-selected", "true");
  await expect(browser).toHaveAttribute("data-window", "full");

  // Minimised or closed, two quick clicks bring the browser back.
  await press('.screen-browser-control[data-control="minimise"]');
  await expect(browser).toHaveAttribute("data-window", "minimised");
  await open();
  await expect(browser).toHaveAttribute("data-window", "full");
  await press('.screen-browser-control[data-control="close"]');
  await expect(browser).toHaveAttribute("data-window", "closed");
  await open();
  await expect(browser).toHaveAttribute("data-window", "full");

  // Open but under another window: it comes to the front, in the size it was.
  await press(".screen-desktop-brave");
  await expect(page.locator(".screen-brave").first()).toHaveAttribute("data-window", "full");
  await expect(browser).toHaveAttribute("data-top", "brave");
  await open();
  await expect(browser).toHaveAttribute("data-top", "browser");
  await expect(browser).toHaveAttribute("data-window", "full");
});
