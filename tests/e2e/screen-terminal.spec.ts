import { expect, test } from "@playwright/test";

test("the laptop's Terminal button opens a window that plays a dev session", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-terminal").first();
  const terminal = page.locator(".screen-terminal").first();
  const press = (selector: string) =>
    terminal.locator(selector).evaluate((el) => (el as HTMLElement).click());

  await expect(terminal).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(terminal).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // The first command types itself, then the server's output prints.
  await expect(terminal.locator(".tm-typed")).toContainText("npm run dev", { timeout: 20000 });
  await expect(terminal.locator(".tm-tail")).toContainText("Ready in 2.5s", { timeout: 20000 });

  // The middle button snaps it to the left half and back.
  await press('.tm-control[data-control="maximise"]');
  await expect(terminal).toHaveAttribute("data-window", "windowed");
  await press('.tm-control[data-control="maximise"]');
  await expect(terminal).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button; the button brings it back.
  await press('.tm-control[data-control="minimise"]');
  await expect(terminal).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(terminal).toHaveAttribute("data-window", "full");

  // Closing starts it over: the next opening plays the session again.
  await press('.tm-control[data-control="close"]');
  await expect(terminal).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("data-state", "closed");
  await expect(terminal.locator(".tm-tail")).toHaveText("", { timeout: 5000 });
});
