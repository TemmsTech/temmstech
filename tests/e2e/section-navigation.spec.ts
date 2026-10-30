import { expect, test } from "@playwright/test";

for (const [path, first, second] of [
  ["capabilities", "disciplines", "starting-points"],
  ["work", "work", "concepts"],
  ["approach", "delivery", "collaboration"],
  ["contact", "brief-guide", "contact"],
]) {
  test(`${path} scroll spy tracks anchors and manual reversal`, async ({
    page,
  }) => {
    await page.goto(`/${path}`);
    const nav = page.getByRole("navigation", { name: "On this page" });
    const firstLink = nav.locator(`a[href="#${first}"]`);
    const secondLink = nav.locator(`a[href="#${second}"]`);
    await firstLink.click();
    await expect(firstLink).toHaveAttribute("aria-current", "location");
    await secondLink.click();
    await expect(secondLink).toHaveAttribute("aria-current", "location");
    await expect(page).toHaveURL(new RegExp(`#${second}$`));
    await secondLink.focus();
    await page
      .locator(`#${first}`)
      .evaluate((el) =>
        el.scrollIntoView({ behavior: "instant", block: "start" }),
      );
    await expect(firstLink).toHaveAttribute("aria-current", "location");
    await expect(secondLink).toBeFocused();
    await expect(page).toHaveURL(new RegExp(`#${second}$`));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
