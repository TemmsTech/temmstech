import { expect, test } from "@playwright/test";

test("the laptop's Brave window opens from its taskbar button and its desktop icon, and switches between three tabs", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });

  const button = page.locator(".screen-desktop-brave").first();
  const app = page.locator(".screen-brave").first();
  const press = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());

  await expect(app).toHaveAttribute("data-window", "closed");
  await button.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(button).toHaveAttribute("data-state", "open");

  // Three tabs; the first is this site. Pressing a tab shows its page and address.
  await expect(app.locator(".br-tab")).toHaveCount(3);
  await expect(app.locator(".br-url-text")).toHaveText("localhost:3000");
  await press('[data-tab="claude"]');
  await expect(app.locator('.br-pane[data-pane="claude"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".br-url-text")).toContainText("claude.ai/chat/");
  await press('[data-tab="chatgpt"]');
  await expect(app.locator('.br-pane[data-pane="chatgpt"]')).toHaveAttribute("data-on", "");
  await expect(app.locator(".br-url-text")).toContainText("chatgpt.com/c/");
  await expect(app.locator(".br-pane[data-on]")).toHaveCount(1);

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
  await expect(app.locator(".br-url-text")).toContainText("chatgpt.com/c/");

  // Closing resets it to the first tab; the Brave desktop icon (two quick clicks) opens it again.
  await press('[data-control="close"]');
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(button).toHaveAttribute("data-state", "closed");
  await expect(app.locator(".br-url-text")).toHaveText("localhost:3000", { timeout: 5000 });
  const icon = page.locator('.screen-desktop-icon[aria-label="Brave"]').first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
});

test("the laptop's Brave window browses: a new tab loads a typed link, back and forward walk its history, and tabs close", async ({
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

  const app = page.locator(".screen-brave").first();
  const click = (selector: string) =>
    app.locator(selector).first().evaluate((el) => (el as HTMLElement).click());
  const enter = (text: string) =>
    app.locator(".br-url-input").evaluate((el, value) => {
      const input = el as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }, text);
  const tabs = app.locator(".br-tab");

  await page.locator(".screen-desktop-brave").first().evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "full");
  await expect(tabs).toHaveCount(3);

  // The + opens a blank tab and the address bar takes the typing.
  await click(".br-tab-add");
  await expect(tabs).toHaveCount(4);
  await expect(app.locator('.br-pane[data-kind="blank"]')).toHaveCount(1);
  await click(".br-url");
  await enter("not a link");
  await expect(app.locator(".br-url[data-invalid]")).toHaveCount(1);

  // A valid link loads as a live page and the tab takes the site's name.
  await enter("demo.example.com/page");
  await expect(app.locator(".br-frame")).toHaveAttribute("src", "https://demo.example.com/page");
  await expect(app.locator(".br-url-text")).toHaveText("demo.example.com/page");
  await expect(tabs.last().locator(".br-tab-title")).toHaveText("demo.example.com");
  await expect(
    page.frameLocator(".br-frame").last().getByText("Demo page"),
  ).toBeAttached();

  // Back returns to the blank page, forward to the site.
  await click('[data-nav="back"]');
  await expect(app.locator('.br-pane[data-kind="blank"]')).toHaveCount(1);
  await click('[data-nav="forward"]');
  await expect(app.locator(".br-url-text")).toHaveText("demo.example.com/page");

  // Closing the open tab hands the window to its neighbour; the starting tabs stay.
  await tabs.last().locator(".br-tab-x").evaluate((el) => (el as HTMLElement).click());
  await expect(tabs).toHaveCount(3);
  await expect(app.locator(".br-pane[data-on]")).toHaveCount(1);

  // Closing every tab closes the window; it starts over with the starting tabs.
  for (let left = 3; left > 0; left -= 1)
    await tabs.first().locator(".br-tab-x").evaluate((el) => (el as HTMLElement).click());
  await expect(app).toHaveAttribute("data-window", "closed");
  await expect(tabs).toHaveCount(3, { timeout: 5000 });
});
