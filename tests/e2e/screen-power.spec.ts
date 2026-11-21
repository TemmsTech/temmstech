import { expect, test } from "@playwright/test";

test("the Start menu's power button locks, sleeps, shuts down and restarts the laptop screen", async ({
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

  const start = page.locator(".screen-taskbar-start").first();
  const menu = page.locator(".screen-start").first();
  const screen = page.locator(".screen-power").first();
  const click = (selector: string) =>
    page.locator(selector).first().evaluate((el) => (el as HTMLElement).click());
  const choose = async (action: string) => {
    await start.evaluate((el) => (el as HTMLElement).click());
    await expect(menu).toHaveAttribute("data-open", "true");
    await click(".st-power");
    await click(`.st-flyout-item[data-action="${action}"]`);
    await expect(menu).toHaveAttribute("data-open", "false");
  };

  await expect(screen).toHaveAttribute("data-view", "none");

  // Sign-in: a wrong password is refused, "password" (any case) lets you in.
  const signIn = async () => {
    await page.keyboard.type("nope");
    await click(".pw-signin-button");
    await expect(screen).toHaveAttribute("data-view", "signin");
    await expect(page.locator(".pw-problem").first()).toContainText("incorrect");
    await page.keyboard.type("PassWord");
    await click(".pw-signin-button");
  };

  // Lock: the lock screen, a press goes on to the sign-in, the button unlocks.
  await choose("lock");
  await expect(screen).toHaveAttribute("data-view", "lock");
  await click(".screen-power");
  await expect(screen).toHaveAttribute("data-view", "signin");
  await signIn();
  await expect(screen).toHaveAttribute("data-view", "none");

  // Sleep: black until a press, then the lock screen.
  await choose("sleep");
  await expect(screen).toHaveAttribute("data-view", "black");
  await click(".screen-power");
  await expect(screen).toHaveAttribute("data-view", "lock");
  await click(".screen-power");
  await signIn();
  await expect(screen).toHaveAttribute("data-view", "none");

  // Restart: says so, goes black, boots, lands on the lock screen.
  await choose("restart");
  await expect(screen).toHaveAttribute("data-view", "wait");
  await expect(screen).toHaveAttribute("data-view", "boot", { timeout: 8000 });
  await expect(screen).toHaveAttribute("data-view", "lock", { timeout: 8000 });
  await click(".screen-power");
  await signIn();
  await expect(screen).toHaveAttribute("data-view", "none");

  // Shut down: black for good; a press does nothing.
  await choose("shutdown");
  await expect(screen).toHaveAttribute("data-view", "black", { timeout: 8000 });
  await click(".screen-power");
  await expect(screen).toHaveAttribute("data-view", "black");
});
