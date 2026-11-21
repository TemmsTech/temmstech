import { expect, test } from "@playwright/test";

test("the laptop's Recycle Bin opens from its desktop icon, restores and deletes items, and minimises into the taskbar", async ({
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

  const app = page.locator(".screen-recycle-bin").first();
  const button = page.locator(".screen-desktop-bin").first();
  const icon = page.locator('.screen-desktop-icon[aria-label="Recycle Bin"]').first();
  const click = (selector: string, init?: { ctrlKey?: boolean }) =>
    app
      .locator(selector)
      .first()
      .evaluate(
        (el, options) =>
          el.dispatchEvent(new MouseEvent("click", { bubbles: true, ...options })),
        init,
      );
  const items = app.locator(".rb-item");

  // Not pinned: no taskbar button until the window is open. Two quick clicks on the icon open it.
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("hidden", "");
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");
  await expect(items).toHaveCount(19);
  await expect(app.locator(".rb-count")).toHaveText("19 items");

  // Click selects; Ctrl adds; the restore button follows the selection.
  await expect(app.locator(".rb-restore-label")).toHaveText("Restore all items");
  await click('[data-item="intro"]');
  await expect(app.locator(".rb-restore-label")).toHaveText("Restore this item");
  await click('[data-item="iphone-16"]', { ctrlKey: true });
  await expect(app.locator(".rb-restore-label")).toHaveText("Restore the selected items");
  await expect(app.locator(".rb-sel")).toHaveText("2 items selected");

  // Restoring the selection takes those items out of the bin.
  await click('[data-action="restore"]');
  await expect(items).toHaveCount(17);
  await expect(app.locator('[data-item="intro"]')).toHaveCount(0);

  // Details shows the selected item's own facts.
  await click('[data-item="makinde-desktop"]');
  await click('[data-action="details"]');
  await expect(app.locator(".rb-details")).toContainText("Original location");
  await expect(app.locator(".rb-details")).toContainText("makinde-desktop");
  await click('[data-action="details"]');

  // Deleting for good asks first: No keeps it, Yes removes it. Nothing else answers meanwhile.
  await click('[data-item="talawan-mobile"]');
  await click('[data-action="delete"]');
  await expect(app.locator(".rb-dialog")).toHaveAttribute("data-open", "");
  await click('[data-item="talawan-desktop"]');
  await expect(app.locator('[data-item="talawan-mobile"]')).toHaveAttribute("data-selected", "true");
  await click('[data-answer="no"]');
  await expect(items).toHaveCount(17);
  await click('[data-action="delete"]');
  await click('[data-answer="yes"]');
  await expect(items).toHaveCount(16);

  // The middle button toggles windowed and full.
  await click('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await click('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button, keeps the contents, and the button brings it back.
  await click('[data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(items).toHaveCount(16);

  // Emptying leaves an empty folder; the empty and restore buttons switch off.
  await click('[data-action="empty"]');
  await click('[data-answer="yes"]');
  await expect(app.locator(".rb-empty")).toHaveText("This folder is empty.");
  await expect(app.locator('[data-action="empty"]')).toHaveAttribute("data-off", "true");

  // Closing puts everything back and drops the taskbar button; the icon opens it again.
  await click('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("hidden", "");
  await expect(items).toHaveCount(19, { timeout: 5000 });
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
});
