import { expect, test } from "@playwright/test";

test("the laptop's Chrome window opens from its desktop icon, switches between two tabs, and its taskbar button comes and goes", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-chrome").first();
  const app = page.locator(".screen-chrome").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  // Closed: no taskbar button. The Chrome desktop icon (two quick clicks) opens it.
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  const icon = page.locator('.screen-desktop-icon[aria-label="Google Chrome"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // Two tabs; the first is the SlipDesk page. Pressing a tab shows its page and address.
  await expect(app.locator(".ch-tab")).toHaveCount(2);
  await expect(app.locator(".ch-url-text")).toContainText("SlipDesk/slip-desk.html");
  await press('[data-tab="claude"]');
  await expect(app.locator('.ch-pane[data-pane="claude"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".ch-url-text")).toContainText("claude.ai/chat/");
  await expect(app.locator(".ch-pane[data-on]")).toHaveCount(1);

  // The middle button toggles windowed and full.
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "windowed");
  await press('[data-control="maximise"]');
  await expect(app).toHaveAttribute("data-window", "full");

  // Minimising shrinks into the taskbar button, keeps the tab, and the button brings it back.
  await press('[data-control="minimise"]');
  await expect(app).toHaveAttribute("data-window", "minimised");
  await expect(button).toHaveAttribute("data-state", "minimised");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(app.locator(".ch-url-text")).toContainText("claude.ai/chat/");

  // Closing resets it to the first tab and takes the taskbar button away.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toBeHidden();
  await expect(app.locator(".ch-url-text")).toContainText("SlipDesk/slip-desk.html", {
    timeout: 5000,
  });
});

test("the laptop's Chrome window browses: a new tab loads a typed link, back and forward walk its history, and tabs close", async ({
  page,
}) => {
  test.setTimeout(90000);
  // A stub stands in for the real site, so the test never needs the network.
  await page.route("https://demo.example.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>Demo</title><p>Demo page</p>" }),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const app = page.locator(".screen-chrome").first();
  const click = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());
  const enter = (text: string) =>
    app.locator(".ch-url-input").evaluate((el, value) => {
      const input = el as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }, text);
  const tabs = app.locator(".ch-tab");

  const icon = page.locator('.screen-desktop-icon[aria-label="Google Chrome"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(tabs).toHaveCount(2);

  // The + opens a blank tab and the address bar takes the typing.
  await click(".ch-tab-add");
  await expect(tabs).toHaveCount(3);
  await expect(app.locator('.ch-pane[data-kind="blank"]')).toHaveCount(1);
  await click(".ch-url");
  await enter("not a link");
  await expect(app.locator(".ch-url[data-invalid]")).toHaveCount(1);

  // A valid link loads as a live page and the tab takes the site's name.
  await enter("demo.example.com/page");
  await expect(app.locator(".ch-frame")).toHaveAttribute("src", "https://demo.example.com/page");
  await expect(app.locator(".ch-url-text")).toHaveText("demo.example.com/page");
  await expect(tabs.last().locator(".ch-tab-title")).toHaveText("demo.example.com");
  await expect(
    page.frameLocator(".ch-frame").last().getByText("Demo page"),
  ).toBeAttached();

  // Back returns to the blank page, forward to the site.
  await click('[data-nav="back"]');
  await expect(app.locator('.ch-pane[data-kind="blank"]')).toHaveCount(1);
  await click('[data-nav="forward"]');
  await expect(app.locator(".ch-url-text")).toHaveText("demo.example.com/page");

  // Closing the open tab hands the window to its neighbour; the starting tabs stay.
  await tabs.last().locator(".ch-tab-x").evaluate((el) => (el as HTMLElement).click());
  await expect(tabs).toHaveCount(2);
  await expect(app.locator(".ch-pane[data-on]")).toHaveCount(1);

  // Closing every tab closes the window; it starts over with the starting tabs.
  for (let left = 2; left > 0; left -= 1)
    await tabs.first().locator(".ch-tab-x").evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(tabs).toHaveCount(2, { timeout: 5000 });
});
