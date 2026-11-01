import { expect, test } from "@playwright/test";

test("approach reveal expands, hands off and reverses", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/approach");
  const track = page.locator('.section-reveal[data-target="collaboration"]');
  const surface = track.locator(".section-reveal-surface");
  await expect(track.locator(".section-reveal-backdrop")).toBeAttached();
  const bounds = await track.evaluate((el) => {
    const end = el.getBoundingClientRect().bottom + scrollY;
    return { start: end - el.clientHeight - innerHeight, end };
  });
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.start + (bounds.end - bounds.start) * 0.75,
  );
  await expect(surface).toBeVisible();
  await expect(surface).toContainText("How we keep the work clear.");
  await expect(surface).toHaveAttribute("inert", "");
  await expect(surface.locator("[id]")).toHaveCount(0);
  await expect(page.locator("#collaboration")).toBeHidden();
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.end,
  );
  await expect(surface).toBeHidden();
  await expect(page.locator("#collaboration h2")).toBeInViewport();
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.end - 100,
  );
  await expect(surface).toBeVisible();
});

test("fast wheel gestures traverse the reveal rather than skipping it", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/approach");
  const track = page.locator('.section-reveal[data-target="collaboration"]');
  await expect(track.locator(".section-reveal-backdrop")).toBeAttached();
  const bounds = await track.evaluate((el) => {
    const end = el.getBoundingClientRect().bottom + scrollY;
    return { start: end - el.clientHeight - innerHeight, end };
  });
  await page.evaluate(
    (y) => scrollTo({ top: y, behavior: "instant" }),
    bounds.start - 10,
  );
  await page.mouse.wheel(0, 10000);
  await expect(track.locator(".section-reveal-surface")).toBeVisible();
  await expect
    .poll(() => page.evaluate((end) => Math.abs(scrollY - end), bounds.end))
    .toBeLessThanOrEqual(1);
  await page.mouse.wheel(0, -10000);
  await expect(track.locator(".section-reveal-surface")).toBeVisible();
  await expect
    .poll(() => page.evaluate((start) => Math.abs(scrollY - start), bounds.start))
    .toBeLessThanOrEqual(1);
  await page.mouse.wheel(0, 10000);
  await expect
    .poll(() => page.evaluate((end) => Math.abs(scrollY - end), bounds.end))
    .toBeLessThanOrEqual(1);
  await page.mouse.wheel(0, 100);
  await expect
    .poll(() => page.evaluate(() => scrollY))
    .toBeGreaterThan(bounds.end + 20);
});

test("reduced motion and direct links expose real content without a reveal", async ({
  page,
}) => {
  await page.goto("/approach#collaboration");
  await expect(page.locator("#collaboration h2")).toBeInViewport();
  await expect(page.locator(".section-reveal").first()).toBeHidden();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/approach#collaboration");
  await expect(page.locator("#collaboration h2")).toBeInViewport();
  await expect(
    page.locator(
      '.section-reveal[data-target="collaboration"] .section-reveal-surface',
    ),
  ).toBeHidden();
});
