import { expect, test } from "@playwright/test";

test("the laptop's File Explorer is driven by the mouse and opens files in VS Code", async ({
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
  // The screen is projected in 3D, so clicks are sent to the elements directly.
  const press = (locator: ReturnType<typeof page.locator>, times = 1) =>
    locator.evaluate((el, count) => {
      for (let i = 0; i < count; i += 1) (el as HTMLElement).click();
    }, times);

  await expect(explorer).toHaveAttribute("data-window", "closed");
  await press(button);
  await expect(explorer).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The middle button snaps it to the right half and back.
  const maximise = explorer.locator('.ex-control[data-control="maximise"]');
  await press(maximise);
  await expect(explorer).toHaveAttribute("data-window", "windowed");
  await press(maximise);
  await expect(explorer).toHaveAttribute("data-window", "full");

  // No simulated pointer, and left alone nothing opens by itself.
  await expect(page.locator(".screen-cursor")).toHaveCount(0);
  await page.waitForTimeout(3000);
  await expect(code).toHaveAttribute("data-window", "closed");

  // Two clicks open a folder, then a file, which VS Code types out.
  await press(explorer.locator('.ex-row[data-id="app"]'), 2);
  await expect(explorer.locator('.ex-item[data-id="layout"]')).toHaveCount(1);
  await press(explorer.locator('.ex-item[data-id="layout"]'), 2);
  await expect(code).toHaveAttribute("data-window", "full");
  await expect(code.locator(".vs-tab-name")).toHaveText("layout.tsx");
  await expect(code.locator(".vs-code")).toContainText("import", {
    timeout: 15000,
  });
  await expect(explorer).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");

  // A click on a row of VS Code's own tree opens another file.
  await press(code.locator('.vs-row[data-file="app/page.tsx"]'));
  await expect(code.locator(".vs-tab-name")).toHaveText("page.tsx");

  // Closing VS Code puts the typing view back for its next opening.
  await press(code.locator('.vs-control[data-control="close"]'));
  await expect(code).toHaveAttribute("data-window", "closed");
  await expect(code.locator(".vs-tab-name")).toHaveText("AboutHero.jsx");
});
