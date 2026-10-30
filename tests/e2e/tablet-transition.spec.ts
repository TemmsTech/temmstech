import { expect, test, type Page } from "@playwright/test";

async function scrollTransition(page: Page, progress: number) {
  await page.locator(".tablet-transition").evaluate((track, value) => {
    const top = track.getBoundingClientRect().top + scrollY;
    window.scrollTo({
      top: top - innerHeight + (track.clientHeight + innerHeight) * value,
      behavior: "instant",
    });
  }, progress);
}

test("tablet reveals work inside its screen, fills the viewport, and reverses", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const viewport = page.viewportSize();
  if (!viewport)
    throw new Error("A viewport is required for transition checks");
  const track = page.locator(".tablet-transition");
  await expect(track).toHaveAttribute("data-renderer", "ready", {
    timeout: 30000,
  });
  const portal = track.locator(".screen-portal");
  await scrollTransition(page, 0.35);
  await expect(portal).toBeVisible();
  const edge = await portal.boundingBox();
  await scrollTransition(page, 0.75);
  await expect(portal).toBeVisible();
  await expect(portal).toContainText("MOG");
  await expect(portal).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator("#work")).toBeHidden();
  const middle = await portal.boundingBox();
  expect(middle?.height).toBeGreaterThan(100);
  expect(middle?.height ?? 0).toBeGreaterThan((edge?.height ?? 0) * 2);
  expect(middle?.width).toBeLessThan(viewport.width);
  await scrollTransition(page, 0.99);
  await expect
    .poll(async () => (await portal.boundingBox())?.width ?? 0)
    .toBeGreaterThanOrEqual(viewport.width);
  await scrollTransition(page, 0.999);
  await expect
    .poll(async () =>
      portal.locator("h2").evaluate((heading) => {
        const preview = heading.getBoundingClientRect();
        const real = document
          .querySelector("#work h2")
          ?.getBoundingClientRect();
        if (!real) return Infinity;
        return Math.max(
          Math.abs(preview.x - real.x),
          Math.abs(preview.y - real.y),
          Math.abs(preview.width - real.width),
        );
      }),
    )
    .toBeLessThan(4);
  await scrollTransition(page, 1);
  await expect(track.locator(".tablet-transition-stage")).toBeHidden();
  await expect(page.locator("#work")).toBeVisible();
  await page.locator("#work").getByRole("link").first().click({ trial: true });
  await scrollTransition(page, 0.45);
  await expect(portal).toBeVisible();
  await expect(portal).toContainText("MOG");
  await scrollTransition(page, 0);
  await expect(track.locator(".tablet-transition-stage")).toBeHidden();
  await expect(page.locator("#work")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("reduced motion skips the tablet and leaves work accessible", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".tablet-transition")).toHaveAttribute(
    "data-renderer",
    "reduced-motion",
  );
  expect(
    await page.locator(".tablet-transition").evaluate((el) => el.clientHeight),
  ).toBe(0);
  await expect(page.locator(".tablet-transition canvas")).toHaveCount(0);
  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(page.locator("#work")).toBeVisible();
});

test("unavailable tablet falls back without an empty scroll runway", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/models/microsoft-tablet.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".tablet-transition")).toHaveAttribute(
    "data-renderer",
    "fallback",
    { timeout: 30000 },
  );
  expect(
    await page.locator(".tablet-transition").evaluate((el) => el.clientHeight),
  ).toBe(0);
  await expect(page.locator(".tablet-transition-stage")).toBeHidden();
  await expect(page.locator("#work")).toBeVisible();
});

test("normal-motion navigation reaches interactive work", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".tablet-transition")).toHaveAttribute(
    "data-renderer",
    "ready",
    { timeout: 30000 },
  );
  await page.evaluate(() => {
    location.hash = "work";
  });
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeVisible();
  await page.locator("#work").getByRole("link").first().click({ trial: true });
});

test("late tablet loading preserves a direct work link", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/models/microsoft-tablet.glb", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/#work");
    await expect(page.locator("#work h2")).toBeInViewport();
    // Isolate model loading from the browser's still-running anchor scroll.
    await page.evaluate(() => scrollTo({ top: scrollY, behavior: "instant" }));
    const before = await page
      .locator("#work")
      .evaluate((el) => el.getBoundingClientRect().top);
    release();
    await expect(page.locator(".tablet-transition")).toHaveAttribute(
      "data-renderer",
      "ready",
      { timeout: 30000 },
    );
    const after = await page
      .locator("#work")
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(after - before)).toBeLessThan(2);
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator(".tablet-transition-stage")).toBeHidden();
  } finally {
    release();
  }
});
