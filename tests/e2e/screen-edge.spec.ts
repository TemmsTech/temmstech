import { expect, test } from "@playwright/test";

test("the laptop's Microsoft Edge desktop icon opens the browser window, and brings it forward when another window covers it", async ({
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

  const browser = page.locator(".screen-browser").first();
  const icon = page.locator('.screen-desktop-icon[aria-label="Microsoft Edge"]').first();
  const press = (selector: string) =>
    page.locator(selector).first().evaluate((el) => (el as HTMLElement).click());
  const open = async () => {
    await icon.evaluate((el) => (el as HTMLElement).click());
    await icon.evaluate((el) => (el as HTMLElement).click());
  };

  // One click only selects it.
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(icon).toHaveAttribute("data-selected", "true");
  await expect(browser).toHaveAttribute("data-window", "full");

  // Minimised or closed, two quick clicks bring the browser back.
  await press('.screen-browser-control[data-control="minimise"]');
  await expect(browser).toHaveAttribute("data-window", "minimised");
  await open();
  await expect(browser).toHaveAttribute("data-window", "full");
  await press('.screen-browser-control[data-control="close"]');
  await expect(browser).toHaveAttribute("data-window", "closed");
  await open();
  await expect(browser).toHaveAttribute("data-window", "full");

  // Open but under another window: it comes to the front, in the size it was.
  await press(".screen-desktop-brave");
  await expect(page.locator(".screen-brave").first()).toHaveAttribute("data-window", "full");
  await expect(browser).toHaveAttribute("data-top", "brave");
  await open();
  await expect(browser).toHaveAttribute("data-top", "browser");
  await expect(browser).toHaveAttribute("data-window", "full");
});

test("the Edge window's + opens a new tab, its address bar loads typed web links, and closed tabs stay closed", async ({
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

  const browser = page.locator(".screen-browser").first();
  const tabs = browser.locator(".screen-browser-tab:not([hidden])");
  const address = browser.locator("input.screen-browser-url");
  const press = (selector: string, nth = 0) =>
    browser.locator(selector).nth(nth).evaluate((el) => (el as HTMLElement).click());
  const typeAddress = (text: string) =>
    address.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }, text);

  const before = await tabs.count();

  // + opens a blank tab at the end, and it becomes the open one.
  await press(".screen-browser-tab-add");
  await expect(tabs).toHaveCount(before + 1);
  await expect(tabs.last()).toHaveAttribute("data-active", "true");
  await expect(browser.locator(".screen-browser-newtab")).toHaveCount(1);

  // Something that is not a web link is refused, and the tab stays blank.
  await typeAddress("javascript:alert(1)");
  await expect(browser.locator(".screen-browser-address")).toHaveAttribute(
    "data-invalid",
    /valid web address/,
  );
  await expect(browser.locator(".screen-browser-newtab")).toHaveCount(1);

  // A valid link loads as a live page in that tab, and the tab takes the site's name.
  await typeAddress("www.example.com/hello");
  await expect(tabs.last().locator(".screen-browser-tab-title")).toHaveText(
    "example.com",
  );
  await expect(
    browser.locator('iframe[src="https://www.example.com/hello"]'),
  ).toHaveCount(1);
  await expect(browser.locator(".screen-browser-newtab")).toHaveCount(0);
  await expect(browser.locator(".screen-browser-external")).toBeVisible();

  // Closing it unloads the page, and nothing brings it back.
  await press(".screen-browser-tab-close", before);
  await expect(tabs).toHaveCount(before);
  await expect(
    browser.locator('iframe[src="https://www.example.com/hello"]'),
  ).toHaveCount(0);

  // Closing every tab closes the window; opening it again starts with one blank tab.
  for (let left = before; left > 0; left -= 1)
    await press(".screen-browser-tab:not([hidden]) .screen-browser-tab-close");
  await expect(browser).toHaveAttribute("data-window", "closed");
  const icon = page
    .locator('.screen-desktop-icon[aria-label="Microsoft Edge"]')
    .first();
  await icon.evaluate((el) => (el as HTMLElement).click());
  await icon.evaluate((el) => (el as HTMLElement).click());
  await expect(browser).toHaveAttribute("data-window", "full");
  await expect(tabs).toHaveCount(1);
  await expect(tabs.first().locator(".screen-browser-tab-title")).toHaveText(
    "New tab",
  );
});
