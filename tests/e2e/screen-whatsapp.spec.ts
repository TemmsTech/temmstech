import { expect, test } from "@playwright/test";

test("the laptop's WhatsApp button opens a window with switchable screens and a call window", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-whatsapp").first();
  const app = page.locator(".screen-whatsapp").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  await expect(app).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // Chats is the first screen, with several people and one chat open.
  await expect(app).toHaveAttribute("data-view", "chats");
  expect(await app.locator(".wa-chat").count()).toBeGreaterThan(3);
  await expect(app.locator(".wa-thread .wa-msg").first()).toBeVisible();

  // Opening another chat swaps the thread; the call button opens the call window.
  await press('[data-chat="ibrahim"]');
  await expect(app.locator(".wa-thread-head .wa-name")).toHaveText("Ibrahim Sule");
  await press('.wa-thread-head [data-call="voice"]');
  await expect(app.locator(".wa-call")).toHaveAttribute("data-open", "true");
  await press("[data-end]");
  await expect(app.locator(".wa-call")).toHaveAttribute("data-open", "false");

  // The left rail switches screens.
  for (const view of ["calls", "status", "channels", "communities", "chats"]) {
    await press(`[data-rail="${view}"]`);
    await expect(app).toHaveAttribute("data-view", view);
  }

  // Channels lists the channels as display only: rows and Follow do nothing when pressed.
  await press('[data-rail="channels"]');
  await expect(app.locator(".wa-channel")).toHaveCount(5);
  await press(".wa-channel");
  await press(".wa-follow");
  await expect(app).toHaveAttribute("data-view", "channels");
  await expect(app.locator(".wa-call")).toHaveAttribute("data-open", "false");
  await press('[data-rail="chats"]');

  // The middle button toggles windowed and full.
  await press('[data-scope="window"][data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await press('[data-scope="window"][data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button; the button brings it back.
  await press('[data-scope="window"][data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");

  // Closing resets it: the next opening starts on Chats.
  await press('[data-rail="calls"]');
  await press('[data-scope="window"][data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("data-state", "closed");
  await expect(app).toHaveAttribute("data-view", "chats", { timeout: 5000 });
});
