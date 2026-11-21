import { expect, test } from "@playwright/test";

test("the laptop's ChatGPT window opens from its desktop icon, switches between chats, expands its parts, and its taskbar button comes and goes", async ({
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

  const button = page.locator(".screen-desktop-chatgpt").first();
  const app = page.locator(".screen-chatgpt").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  // Closed: no taskbar button. The ChatGPT desktop icon (two quick clicks) opens it.
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  const icon = page.locator('.screen-desktop-icon[aria-label="ChatGPT"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The first chat is on show, with the Outputs and Sources card.
  await expect(app.locator(".gp-chat-item")).toHaveCount(4);
  await expect(app.locator(".gp-title b")).toHaveText("Set up TemmsTech foundation");
  await expect(app.locator(".gp-main")).toHaveAttribute("data-info", "open");

  // "Ran commands" opens and closes; a source row can be selected.
  await press("[data-ran]");
  await expect(app.locator(".gp-ran").first()).toHaveAttribute("data-open", "true");
  await press("[data-source]");
  await expect(app.locator("[data-selected]")).toHaveCount(1);

  // Another chat swaps the conversation; coming back works.
  await press('[data-thread="mog"]');
  await expect(app.locator(".gp-title b")).toHaveText("Start the Mog project");
  await press('[data-thread="foundation"]');
  await expect(app.locator(".gp-title b")).toHaveText("Set up TemmsTech foundation");

  // New chat starts blank and is not duplicated.
  await press("[data-new]");
  await expect(app.locator(".gp-empty")).toHaveCount(1);
  await press("[data-new]");
  await expect(app.locator(".gp-chat-item")).toHaveCount(5);

  // The middle button toggles windowed and full.
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimise keeps the taskbar button; it brings the window back.
  await press('[data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");

  // Close hides the taskbar button, and the window starts over when reopened.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  await expect(app.locator(".gp-chat-item")).toHaveCount(4);
});
