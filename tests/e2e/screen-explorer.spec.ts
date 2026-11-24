import { expect, test } from "@playwright/test";

test("the laptop's File Explorer button opens a window that hands over to VS Code", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-explorer").first();
  const explorer = page.locator(".screen-explorer").first();
  const code = page.locator(".screen-vscode").first();
  const press = (selector: string) =>
    explorer.locator(selector).evaluate((el) => (el as HTMLElement).click());

  await expect(explorer).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(explorer).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The middle button snaps it to the right half and back.
  await press('.ex-control[data-control="maximise"]');
  await expect(explorer).toHaveAttribute("data-window", "windowed");
  await press('.ex-control[data-control="maximise"]');
  await expect(explorer).toHaveAttribute("data-window", "full");

  // Left alone, its tour ends by opening globals.css in VS Code.
  await expect(code).toHaveAttribute("data-window", "full", { timeout: 60000 });
  await expect(code.locator(".vs-tab-name")).toHaveText("globals.css");
  await expect(explorer).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");

  // Closing VS Code puts the typing view back for its next opening.
  await code.locator('.vs-control[data-control="close"]').evaluate((el) =>
    (el as HTMLElement).click(),
  );
  await expect(code).toHaveAttribute("data-window", "closed");
  await expect(code.locator(".vs-tab-name")).toHaveText("AboutHero.jsx");
});

test("double-clicking the 3D Prototypes desktop icon opens File Explorer on the prototypes folder", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const icon = page.locator('.screen-desktop-icon[aria-label="3D Prototypes"]').first();
  const explorer = page.locator(".screen-explorer").first();
  const button = page.locator(".screen-desktop-explorer").first();
  const press = () => icon.evaluate((el) => (el as HTMLElement).click());

  await expect(explorer).toHaveAttribute("data-window", "closed");
  // One click only selects it.
  await press();
  await expect(explorer).toHaveAttribute("data-window", "closed");
  // The second click soon after opens File Explorer on the folder.
  await press();
  await expect(explorer).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");
  await expect(explorer.locator(".ex-tab[data-active=\"true\"] .ex-tab-title")).toHaveText(
    "3D Prototypes",
  );
  await expect(explorer.locator(".ex-count")).toHaveText("11 items");
  await expect(explorer.locator(".ex-item")).toHaveCount(11);
  // Folders open like real ones: GLBs holds 31 models, and Up goes back.
  const open = async (name: string) => {
    const item = explorer.locator(`.ex-item[data-id="${name}"]`);
    await item.click();
    await item.click();
  };
  await open("GLBs");
  await expect(explorer.locator(".ex-count")).toHaveText("31 items");
  await explorer.locator('[data-nav="up"]').click();
  await expect(explorer.locator(".ex-count")).toHaveText("11 items");
  await open("Build");
  await open("TShirt Logo Project");
  await expect(explorer.locator(".ex-count")).toHaveText("11 items");
});
