import { test } from "@playwright/test";

test("genera la evidencia visual verificada de la experiencia", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({ path: "public/screenshots/qa-hero.png" });

  const platformTop = await page.locator("#plataforma").evaluate((section) => section.getBoundingClientRect().top + scrollY);
  await page.evaluate((top) => scrollTo(0, top), platformTop);
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/qa-platform.png" });

  const journey = await page.locator("#recorrido").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    return { top: rect.top + scrollY, height: rect.height, viewport: innerHeight };
  });
  for (const [name, fraction] of [["scene-1", 0], ["scene-3", 0.5], ["scene-5", 1]] as const) {
    await page.evaluate(({ top, height, viewport, fraction }) => scrollTo(0, top + (height - viewport) * fraction), { ...journey, fraction });
    await page.waitForTimeout(180);
    await page.screenshot({ path: `public/screenshots/qa-journey-${name}.png` });
  }

  await page.locator("#arquitectura").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/qa-architecture-gallery.png" });
  await page.locator(".diagram-card").first().getByRole("button", { name: /Explorar diagrama/ }).click();
  await page.getByRole("dialog").locator(".viewer-canvas img").waitFor({ state: "visible" });
  await page.waitForTimeout(450);
  await page.screenshot({ path: "public/screenshots/qa-diagram-viewer.png" });
  await page.getByRole("dialog").getByRole("button", { name: "100%" }).click();
  await page.screenshot({ path: "public/screenshots/qa-diagram-zoom.png" });
  await page.keyboard.press("Escape");

  await page.locator("footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: "public/screenshots/qa-footer.png" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  const revealTargets = page.locator("[data-reveal]");
  for (let index = 0; index < await revealTargets.count(); index += 1) {
    await revealTargets.nth(index).scrollIntoViewIfNeeded();
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.screenshot({ path: "public/screenshots/qa-mobile-390.png", fullPage: true });
});
