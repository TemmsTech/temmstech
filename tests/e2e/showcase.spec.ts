import { expect, test, type Page } from "@playwright/test";

test("fast wheel input still shows the device transition in both directions", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });
  await expect(page.locator("#services")).toBeHidden();
  const bounds = await page.locator(".hero-stage").evaluate((el) => {
    const end = el.closest("section")!.getBoundingClientRect().bottom + scrollY;
    return { start: 0, end };
  });
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.start,
  );
  await page.evaluate(() => {
    const samples: number[] = [];
    Object.assign(window, { __scrollSamples: samples });
    addEventListener("scroll", () => samples.push(scrollY), { passive: true });
  });
  await page.mouse.wheel(0, 10000);
  const portal = page.locator(".device-stage .screen-portal");
  await expect(portal).toBeVisible();
  await expect(page.locator("#services")).toBeHidden();
  await expect
    .poll(() => page.evaluate((end) => Math.abs(scrollY - end), bounds.end), {
      timeout: 20000,
    })
    .toBeLessThanOrEqual(1);
  await expect(page.locator("#services")).toBeVisible();
  const downward = await page.evaluate(
    () => (window as unknown as { __scrollSamples: number[] }).__scrollSamples,
  );
  expect(downward.every((value, index) => index === 0 || value >= downward[index - 1]!)).toBe(true);
  await page.evaluate(
    () => ((window as unknown as { __scrollSamples: number[] }).__scrollSamples = []),
  );
  await page.mouse.wheel(0, -10000);
  await expect(portal).toBeVisible();
  await expect
    .poll(() => page.evaluate((start) => Math.abs(scrollY - start), bounds.start), {
      timeout: 20000,
    })
    .toBeLessThanOrEqual(1);
  const upward = await page.evaluate(
    () => (window as unknown as { __scrollSamples: number[] }).__scrollSamples,
  );
  expect(upward.every((value, index) => index === 0 || value <= upward[index - 1]!)).toBe(true);
  await expect(page.locator("#services")).toBeHidden();
});

test("device screens cycle websites without controls beneath them", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const stage = page.getByRole("img", { name: /Laptop and iPhone/ });
  await expect(stage).toHaveAttribute("data-renderer", "ready", {
    timeout: 30000,
  });
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAccessibleName(/Don Elclasico Wears/, { timeout: 12000 });
  // Only the screen itself (browser window, desktop, video player) and the
  // "Zoom in & interact" button may hold buttons.
  await expect(
    page.locator(
      ".device-showcase button:not(.screen-browser *):not(.device-hint)",
    ),
  ).toHaveCount(0);
  await expect(page.getByText("SCROLL INTO WHAT WE BUILD")).toHaveCount(0);
});

test("static website previews remain usable when models fail", async ({
  page,
}) => {
  await page.route("**/models/*.glb", (route) => route.abort());
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "fallback", { timeout: 30000 });
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone.*MOG/ }),
  ).toBeVisible();
});

test("normal motion scroll reveals the next section then reverses", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });
  await page.evaluate(() => {
    const hero = document.querySelector(".hero-stage");
    if (!hero) throw new Error("Hero missing");
    const bottom = hero.getBoundingClientRect().bottom + scrollY;
    const start = 0;
    window.scrollTo({
      top: start + (bottom - start) * 0.4,
      behavior: "instant",
    });
  });
  const portal = page.locator(".device-stage .screen-portal");
  await expect(portal).toBeVisible();
  await expect(portal).toContainText("Different talents. Shared ambition.");
  await expect(portal).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#services")).toBeHidden();
  await page.evaluate(() => {
    const services = document.getElementById("services");
    if (services)
      scrollTo({
        top: services.getBoundingClientRect().top + scrollY - 2,
        behavior: "instant",
      });
  });
  await expect
    .poll(async () =>
      portal.locator("h2").evaluate((heading) => {
        const preview = heading.getBoundingClientRect();
        const real = document
          .querySelector("#services h2")
          ?.getBoundingClientRect();
        return real
          ? Math.max(
              Math.abs(preview.x - real.x),
              Math.abs(preview.y - real.y),
              Math.abs(preview.width - real.width),
            )
          : Infinity;
      }),
    )
    .toBeLessThan(4);
  await page.evaluate(() => {
    const services = document.getElementById("services");
    if (services)
      window.scrollTo({
        top: services.getBoundingClientRect().top + scrollY,
        behavior: "instant",
      });
  });
  await expect(page.locator("#services")).toBeVisible();
  await expect(
    page.locator("#services").getByRole("heading", { level: 2 }),
  ).toBeInViewport();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("normal-motion capabilities link reveals the real section", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });
  await page.getByRole("link", { name: "Discover our capabilities" }).click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.locator("#services")).toBeVisible();
  await expect(page.locator("#services h2")).toBeInViewport();
});

// --- Interact mode ("Zoom in & interact") ---------------------------------

const readyStage = (page: Page) =>
  page.locator('.device-stage[data-renderer="ready"]');
const host = (page: Page) => readyStage(page).locator("> div").first();
const hint = (page: Page) =>
  page.getByRole("button", { name: "Zoom in & interact" });
const close = (page: Page) => page.getByRole("button", { name: "Close" });
const laptopScreen = (page: Page) =>
  page.locator('.screen-browser[data-kind="laptop"]');
const hostBox = (page: Page) =>
  host(page).evaluate((el) => {
    const { left, top, width, height } = el.getBoundingClientRect();
    return { left, top, width, height };
  });

async function openInteract(page: Page) {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(readyStage(page)).toBeVisible({ timeout: 30000 });
  await hint(page).click();
  await expect(close(page)).toBeFocused();
  // Wait out the zoom.
  await expect
    .poll(async () => (await hostBox(page)).width, { timeout: 5000 })
    .toBeGreaterThan(page.viewportSize()!.width * 0.9);
}

/** Turns the laptop by hand: a drag of this many pixels sideways (and up/down). */
async function turn(page: Page, dx: number, dy = 0) {
  const box = await hostBox(page);
  const x = box.left + box.width / 2;
  const y = box.top + box.height * 0.8; // on the model, away from the screen
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 8 });
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
}

test("zoom button opens interact mode, Escape closes it and restores the page", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(readyStage(page)).toBeVisible({ timeout: 30000 });
  const before = await hostBox(page);
  const scrollBefore = await page.evaluate(() => scrollY);
  const layoutBefore = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  await hint(page).click();
  await expect(close(page)).toBeFocused();
  await expect(hint(page)).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(async () => (await hostBox(page)).width, { timeout: 5000 })
    .toBeGreaterThan(before.width * 1.5);
  const open = await hostBox(page);
  expect(open.width).toBeGreaterThan(page.viewportSize()!.width * 0.9);
  expect(open.height).toBeGreaterThan(page.viewportSize()!.height * 0.85);
  // The page behind does not move or scroll.
  await page.mouse.wheel(0, 600);
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  await page.keyboard.press("Escape");
  await expect(close(page)).toHaveCount(0);
  await expect(hint(page)).toBeFocused();
  await expect(hint(page)).toHaveAttribute("aria-expanded", "false");
  await expect
    .poll(async () => (await hostBox(page)).width, { timeout: 5000 })
    .toBeCloseTo(before.width, 0);
  const after = await hostBox(page);
  expect(after.left).toBeCloseTo(before.left, 0);
  expect(after.top).toBeCloseTo(before.top, 0);
  expect(after.height).toBeCloseTo(before.height, 0);
  await expect(host(page)).not.toHaveAttribute("style", /fixed/);
  await expect(page.locator(".hero-stage")).not.toHaveAttribute(
    "data-interact",
    /.*/,
  );
  expect(await page.evaluate(() => scrollY)).toBe(scrollBefore);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBe(layoutBefore);
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe("");
});

test("the Close button also closes interact mode", async ({ page }) => {
  test.setTimeout(60000);
  await openInteract(page);
  await close(page).click();
  await expect(close(page)).toHaveCount(0);
  await expect(hint(page)).toBeFocused();
});

test("interact mode holds still: no sway, no drift back, wider turns", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openInteract(page);
  const screen = laptopScreen(page);
  const rectOf = () =>
    screen.evaluate((el) => {
      const { x, width } = el.getBoundingClientRect();
      return { x, width, hidden: (el as HTMLElement).hidden };
    });
  // Nothing moves on its own while open.
  const still = await rectOf();
  await page.waitForTimeout(1500);
  const later = await rectOf();
  expect(Math.abs(later.x - still.x)).toBeLessThan(1);
  expect(Math.abs(later.width - still.width)).toBeLessThan(1);
  // A turn of about 55 degrees: well past the old 23-degree-pitch / 57-degree limits' feel,
  // and it stays exactly where it was left.
  await turn(page, 120);
  await page.waitForTimeout(400);
  const turned = await rectOf();
  expect(turned.width).toBeLessThan(still.width * 0.8);
  await page.waitForTimeout(2500);
  const held = await rectOf();
  expect(Math.abs(held.width - turned.width)).toBeLessThan(1);
  expect(Math.abs(held.x - turned.x)).toBeLessThan(1);
  // Far enough round, the back of the lid faces us: the screen is hidden, and
  // so cannot take a click meant for the lid.
  await turn(page, 300);
  await page.waitForTimeout(400);
  expect((await rectOf()).hidden).toBe(true);
  await page.waitForTimeout(2500);
  expect((await rectOf()).hidden).toBe(true);
  // ...and turning back brings it round again.
  await turn(page, -500);
  await page.waitForTimeout(400);
  expect((await rectOf()).hidden).toBe(false);
});

test("tabs on the screen still take clicks at a wide angle", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openInteract(page);
  await turn(page, 110); // roughly 50 degrees round
  await page.waitForTimeout(400);
  const tabs = laptopScreen(page).locator(".screen-browser-tab");
  const target = tabs.nth(2);
  await expect(target).not.toHaveAttribute("data-active", "true");
  // Playwright clicks the element's centre through real hit-testing, so this
  // fails if the projected screen and the clickable one disagree.
  await target.click();
  await expect(target).toHaveAttribute("data-active", "true");
  await turn(page, -110);
});

test("normal hero turns to about 80 degrees, then eases back by itself", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(readyStage(page)).toBeVisible({ timeout: 30000 });
  const screen = laptopScreen(page);
  const width = () =>
    screen.evaluate((el) => el.getBoundingClientRect().width);
  const rest = await width();
  await turn(page, 900);
  await page.waitForTimeout(500);
  // About 80 degrees: far more than before, and still facing us.
  const turned = await width();
  expect(turned).toBeLessThan(rest * 0.6);
  await expect(screen).toBeVisible();
  // Not open, so it drifts home after a moment.
  await expect
    .poll(width, { timeout: 8000 })
    .toBeGreaterThan(turned * 1.4);
});

test("interact mode cannot open after scrolling, and closes if the page scrolls", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(readyStage(page)).toBeVisible({ timeout: 30000 });
  await page.evaluate(() => scrollTo({ top: 40, behavior: "instant" }));
  await hint(page).evaluate((el) => (el as HTMLElement).click());
  await expect(close(page)).toHaveCount(0);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await hint(page).click();
  await expect(close(page)).toBeVisible();
  await page.evaluate(() => scrollTo({ top: 40, behavior: "instant" }));
  await expect(close(page)).toHaveCount(0);
});

test("interact mode closes when the window is resized or the tab is hidden", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openInteract(page);
  await page.setViewportSize({ width: 1180, height: 700 });
  await expect(close(page)).toHaveCount(0);
  await expect(host(page)).not.toHaveAttribute("style", /fixed/);
  await openInteract(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(close(page)).toHaveCount(0);
});

test("reduced motion switches between the two sizes without animating", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(readyStage(page)).toBeVisible({ timeout: 30000 });
  const before = await hostBox(page);
  await hint(page).click();
  // No tween: the very next read is already the final size.
  const open = await hostBox(page);
  expect(open.width).toBeGreaterThan(page.viewportSize()!.width * 0.9);
  await page.keyboard.press("Escape");
  const after = await hostBox(page);
  expect(after.width).toBeCloseTo(before.width, 0);
});
