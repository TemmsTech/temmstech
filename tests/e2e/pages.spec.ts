import { expect, test } from "@playwright/test";

for (const [path, title] of [
  ["capabilities", "Big ideas need more than one kind of thinking."],
  ["work", "Ideas, out in the world."],
  ["approach", "From the first idea, To launch & beyond."],
  ["contact", "Your next idea starts with a conversation."],
]) {
  test(`${path} page loads directly and links home`, async ({ page }) => {
    const response = await page.goto(`/${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator("#contact")).toBeAttached();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("banner")
      .getByRole("link", { name: "TemmsTech home" })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Built by us. Used by millions.",
    );
  });
}

test("work separates supplied websites from sample concepts", async ({
  page,
}) => {
  await page.goto("/work");
  const work = page.locator("#work");
  await expect(work.getByRole("article")).toHaveCount(8);
  for (const [name, url] of [
    ["Don Elclasico Wears", "https://donelclasico.netlify.app"],
    ["Santy Stitches", "https://santystitches.netlify.app"],
    ["Talawan Global Farms", "https://talawan-global-farms.vercel.app/"],
    ["NaijaLearn", "https://naijalearn.netlify.app/"],
    ["Makinde Bibitayo", "https://makindebibitayo.netlify.app/"],
    ["MOG", "https://mog-nine.vercel.app/"],
    ["CMWG Travel", "https://cmwgtours.netlify.app"],
    ["Proximity News", "https://proximitynews.netlify.app"],
  ]) {
    const link = work.getByRole("link", {
      name: `Visit ${name} website (opens in a new tab)`,
      exact: true,
    });
    await expect(link).toHaveAttribute("href", url);
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
  await expect(
    page.locator("#concepts").getByText("Sample concept", { exact: true }),
  ).toHaveCount(3);
});

test("homepage reveals previous work in batches of four", async ({ page }) => {
  await page.goto("/");
  const work = page.locator("#work");
  await expect(work.getByRole("article")).toHaveCount(4);
  await expect(work.getByRole("article").first()).toContainText("MOG");
  await expect(
    work.getByRole("article").filter({ hasText: "Makinde Bibitayo" }),
  ).toHaveCount(0);
  await work.getByRole("button", { name: "Show more", exact: true }).click();
  await expect(work.getByRole("article")).toHaveCount(8);
  await expect(work.getByRole("status")).toHaveText("Showing 8 of 8 projects.");
  await expect(
    work.getByRole("link", {
      name: "Visit NaijaLearn website (opens in a new tab)",
    }),
  ).toBeFocused();
  await expect(
    work.getByRole("button", { name: "Show more", exact: true }),
  ).toHaveCount(0);
});

test("supporting pages provide their own deeper content", async ({ page }) => {
  await page.goto("/capabilities");
  await expect(
    page.getByRole("heading", { name: "Build the whole experience." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Start with the uncertainty." }),
  ).toBeAttached();
  await page.goto("/approach");
  await expect(
    page.getByRole("heading", { name: "Decisions before deliverables." }),
  ).toBeAttached();
  await expect(page.getByText(/Release checklist/)).toBeAttached();
  await page.goto("/contact");
  await page.getByRole("link", { name: /Prepare your brief/ }).click();
  await expect(page.getByLabel("What would you like to solve?")).toBeVisible();
  await page
    .getByLabel("What would you like to solve?")
    .fill("A clearer ordering workflow.");
  await expect(
    page.getByRole("button", { name: "Send project brief" }),
  ).toBeEnabled();
});

test("navbar navigation starts each destination at the top", async ({
  page,
}) => {
  await page.goto("/approach");
  for (const [label, path] of [
    ["Capabilities", "/capabilities"],
    ["Capabilities", "/capabilities"],
    ["Our work", "/work"],
  ]) {
    await page.evaluate(() =>
      window.scrollTo({ top: 500, behavior: "instant" }),
    );
    await expect(
      page.getByRole("banner", { includeHidden: true }),
    ).toHaveAttribute("data-hidden", "true");
    await page.evaluate(() =>
      window.scrollTo({ top: 400, behavior: "instant" }),
    );
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    const menu = header.getByRole("button", { name: "Open menu" });
    const compact = await menu.isVisible();
    if (compact) await menu.click();
    await header
      .getByRole("navigation", {
        name: compact ? "Mobile" : "Primary",
        exact: true,
      })
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  }
});

test("start links open the nearest brief form", async ({ page }) => {
  await page.goto("/approach");
  await page.getByRole("link", { name: /Tell us about your project/ }).click();
  await expect(page).toHaveURL(/\/contact#contact$/);
  await expect(page.getByLabel("What would you like to solve?")).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: /Let’s talk/ }).click();
  await expect(page).toHaveURL(/\/contact$/);
});
