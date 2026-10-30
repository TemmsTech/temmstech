import { expect, test } from "@playwright/test";

test("homepage explains the company, shows its imagery, and reaches each section", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(
    "TemmsTech \u2014 Built by us. Used by millions.",
  );
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.locator('.site-navbar nav a[href="/"][aria-current="page"]'),
  ).toHaveCount(2);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Built by us. Used by millions.",
  );
  await expect(
    page.getByRole("link", { name: "Build with TemmsTech" }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });
  for (const id of ["services", "work", "approach", "contact"]) {
    const section = page.locator(`#${id}`);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport();
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByText("Sample concept", { exact: true })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});

test("hero title and supporting copy scramble and settle", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveAttribute(
    "aria-label",
    "Built by us. Used by millions.",
  );
  await expect(heading.locator('span[aria-hidden="true"]').first()).toContainText(
    "Made to work.",
    { timeout: 20000 },
  );
  await expect(page.locator(".hero-description > span:first-child")).toContainText(
    "Across web platforms, mobile apps",
    { timeout: 20000 },
  );
  await expect(heading.locator('span[aria-hidden="true"]').first()).toContainText(
    "Code. Craft. AI.",
    { timeout: 20000 },
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(heading).toHaveText("Built by us. Used by millions.");
});

test("navigation works at desktop and compact widths", async ({ page }) => {
  await page.goto("/");
  const menu = page.getByRole("button", { name: /^(Open|Close) menu$/ });
  const compact = await menu.isVisible();
  if (compact) {
    await expect(
      page.getByRole("navigation", { name: "Mobile", exact: true }),
    ).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
  }
  for (const [label, target] of [
    ["Capabilities", "capabilities"],
    ["Our work", "work"],
    ["Our approach", "approach"],
  ]) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(page.getByRole("banner")).toBeVisible();
    if (compact) await menu.click();
    await page
      .getByRole("navigation", {
        name: compact ? "Mobile" : "Primary",
        exact: true,
      })
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${target}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (compact)
      await expect(
        page.locator('[aria-controls="mobile-navigation"]'),
      ).toHaveAttribute("aria-expanded", "false");
  }
});

test("keyboard users can skip navigation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("sample concepts disclose their scope", async ({ page }) => {
  await page.goto("/work#concepts");
  const concept = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "A better way to sell." }),
  });
  await concept.getByText(/Explore the idea/).click();
  await expect(
    concept.getByText(/not a delivered client project/),
  ).toBeVisible();
});

test("visitors can prepare a brief without a false submission", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("link", { name: "Build with TemmsTech" }).click();
  await expect(page).toHaveURL(/#contact$/);
  await page
    .locator("#contact")
    .getByText("Start a conversation", { exact: true })
    .click();
  await page
    .getByLabel("What would you like to solve?")
    .fill("We need to connect our stock and ordering systems.");
  const copy = page.getByRole("button", { name: "Copy project brief" });
  if (await copy.isVisible()) {
    await copy.click();
    await expect(page.locator("#contact").getByRole("status")).toContainText(
      "Brief copied.",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "We need to connect our stock and ordering systems.",
    );
  } else {
    await expect(
      page.getByRole("link", { name: "Open email draft" }),
    ).toHaveAttribute("href", /^mailto:.+body=We/);
  }
});

test("navbar hides on scroll down and reveals on scroll up", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("header");
  await expect(header).toHaveAttribute("data-hidden", "false");

  await expect(
    page.getByRole("img", { name: /Laptop and iPhone/ }),
  ).toHaveAttribute("data-renderer", "ready", { timeout: 30000 });
  await page.evaluate(() => window.scrollTo({ top: 30, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-hidden", "true");
  const backdrop = await page.evaluate(() => {
    const hero = document.querySelector(".hero-stage");
    return {
      page: getComputedStyle(document.body).backgroundColor,
      hero: hero ? getComputedStyle(hero).backgroundColor : null,
    };
  });
  expect(backdrop.page).toBe(backdrop.hero);

  await page.locator("#work").scrollIntoViewIfNeeded();
  await expect(header).toHaveAttribute("data-hidden", "true");
  await expect(header).toHaveAttribute("inert", "");

  // A meaningful reversal reveals it without reacting to trackpad noise.
  await page.mouse.wheel(0, -80);
  await expect(header).toHaveAttribute("data-hidden", "false");

  // Scrolling back down hides it again.
  await page.mouse.wheel(0, 80);
  await expect(header).toHaveAttribute("data-hidden", "true");

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-hidden", "false");
});
