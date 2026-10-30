import { expect, test } from "@playwright/test";

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
  await expect(page.locator(".device-showcase button")).toHaveCount(0);
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
