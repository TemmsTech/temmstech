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
