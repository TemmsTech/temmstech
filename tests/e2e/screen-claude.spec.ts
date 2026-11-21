import { expect, test } from "@playwright/test";

test("the laptop's Claude window opens from its desktop icon, switches between chats, opens files, and its taskbar button comes and goes", async ({
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

  const button = page.locator(".screen-desktop-claude").first();
  const app = page.locator(".screen-claude").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  // Closed: no taskbar button. The Claude desktop icon (two quick clicks) opens it.
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  const icon = page.locator('.screen-desktop-icon[aria-label="Claude"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The build chat is first, with a file open in the side panel.
  await expect(app.locator(".cl-thread-item")).toHaveCount(4);
  await expect(app.locator(".cl-title b")).toContainText("multi-app desktop prototype");
  await expect(app.locator(".cl-body")).toHaveAttribute("data-panel", "open");

  // Pressing a file card selects it and shows its code.
  await press('[data-file="open-zoom"]');
  await expect(app.locator(".cl-panel-name")).toContainText("Open zoom");
  await expect(app.locator(".cl-file[data-selected]")).toHaveCount(1);

  // Another chat swaps the conversation; coming back keeps the chosen file.
  await press('[data-thread="search"]');
  await expect(app.locator(".cl-title b")).toContainText("Search panel bug");
  await press('[data-thread="build"]');
  await expect(app.locator(".cl-panel-name")).toContainText("Open zoom");

  // New chat starts blank, with the panel closed, and is not duplicated.
  await press("[data-new]");
  await expect(app.locator(".cl-empty")).toHaveCount(1);
  await expect(app.locator(".cl-body")).toHaveAttribute("data-panel", "closed");
  await press("[data-new]");
  await expect(app.locator(".cl-thread-item")).toHaveCount(5);

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

  // Close hides the taskbar button, and the window starts over (original chats) when reopened.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  await expect(app.locator(".cl-thread-item")).toHaveCount(4);
});
