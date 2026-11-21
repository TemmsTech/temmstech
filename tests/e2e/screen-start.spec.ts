import { expect, test } from "@playwright/test";

test("the laptop's Start button opens a menu that searches the apps, launches a window and closes", async ({
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

  const button = page.locator(".screen-taskbar-start").first();
  const menu = page.locator(".screen-start").first();
  const press = (selector: string) =>
    menu.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  await expect(menu).toHaveAttribute("data-open", "false");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(menu).toHaveAttribute("data-open", "true");
  await expect(button).toHaveAttribute("data-open", "true");

  // The home view: twelve pinned apps, four recent items and six folders.
  await expect(menu.locator(".st-pin")).toHaveCount(12);
  await expect(menu.locator(".st-recent-item")).toHaveCount(4);
  await expect(menu.locator(".st-folder")).toHaveCount(6);

  // A folder opens into a list; its back button returns home.
  await press(".st-folder");
  await expect(menu.locator(".st-result")).toHaveCount(4);
  await press(".st-back");
  await expect(menu.locator(".st-pin")).toHaveCount(12);

  // Typing searches; Enter launches the first match, which has a window, and the menu closes.
  const type = (value: string) =>
    menu.locator(".st-search-input").evaluate((el, text) => {
      const input = el as HTMLInputElement;
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  await type("claude");
  await expect(menu.locator(".st-result")).toHaveCount(1);
  await menu
    .locator(".st-search-input")
    .evaluate((el) => el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
  await expect(menu).toHaveAttribute("data-open", "false");
  await expect(page.locator(".screen-claude").first()).toHaveAttribute("data-window", "full");

  // A press anywhere else on the screen closes it too.
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(menu).toHaveAttribute("data-open", "true");
  await page
    .locator(".screen-desktop")
    .first()
    .evaluate((el) => el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
  await expect(menu).toHaveAttribute("data-open", "false");
});
