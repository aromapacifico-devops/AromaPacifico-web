import { expect, test } from "@playwright/test";

test("la galería usa previews locales y abre los cuatro diagramas sin navegar", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#arquitectura").scrollIntoViewIfNeeded();

  const cards = page.locator(".diagram-card");
  await expect(cards).toHaveCount(4);
  await expect(cards.locator("a")).toHaveCount(0);
  const previewPaths = await cards.locator("img").evaluateAll((images) => images.map((image) => new URL((image as HTMLImageElement).src).pathname));
  expect(previewPaths.every((path) => path.startsWith("/architecture/") && path.endsWith(".preview.webp"))).toBeTruthy();

  const startingUrl = page.url();
  for (let index = 0; index < 4; index += 1) {
    const trigger = cards.nth(index).getByRole("button", { name: /Explorar diagrama/ });
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const originalPath = await page.getByRole("dialog").locator(".viewer-canvas img").evaluate((image) => new URL((image as HTMLImageElement).src).pathname);
    expect(originalPath).toMatch(/^\/architecture\/.*\.drawio\.png$/);
    expect(page.url()).toBe(startingUrl);
    await page.getByRole("button", { name: "Cerrar visor" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("zoom, rueda, pan y navegación conservan límites y proporciones", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator("#arquitectura").scrollIntoViewIfNeeded();
  await page.locator(".diagram-card").first().getByRole("button", { name: /Explorar diagrama/ }).click();
  const dialog = page.getByRole("dialog");
  const viewport = dialog.locator(".viewer-viewport");
  const canvas = dialog.locator(".viewer-canvas");
  const scale = dialog.locator(".viewer-scale");
  await expect(dialog.locator(".viewer-canvas img")).toBeVisible();

  const fitPercent = Number((await scale.textContent())?.replace("%", ""));
  const viewportBox = await viewport.boundingBox();
  const imageBox = await dialog.locator(".viewer-canvas img").boundingBox();
  expect(viewportBox).not.toBeNull();
  expect(imageBox).not.toBeNull();
  expect(imageBox!.x).toBeGreaterThanOrEqual(viewportBox!.x - 2);
  expect(imageBox!.x + imageBox!.width).toBeLessThanOrEqual(viewportBox!.x + viewportBox!.width + 2);
  expect(imageBox!.y).toBeGreaterThanOrEqual(viewportBox!.y - 2);
  expect(imageBox!.y + imageBox!.height).toBeLessThanOrEqual(viewportBox!.y + viewportBox!.height + 2);

  await dialog.getByRole("button", { name: "Acercar" }).click();
  expect(Number((await scale.textContent())?.replace("%", ""))).toBeGreaterThan(fitPercent);
  const beforeWheel = await scale.textContent();
  await viewport.hover({ position: { x: viewportBox!.width * 0.7, y: viewportBox!.height * 0.45 } });
  await page.mouse.wheel(0, -220);
  await expect(scale).not.toHaveText(beforeWheel ?? "");

  const beforePan = await canvas.getAttribute("style");
  await page.mouse.move(viewportBox!.x + viewportBox!.width / 2, viewportBox!.y + viewportBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(viewportBox!.x + viewportBox!.width / 2 + 120, viewportBox!.y + viewportBox!.height / 2 + 70, { steps: 4 });
  await page.mouse.up();
  expect(await canvas.getAttribute("style")).not.toBe(beforePan);

  await dialog.getByRole("button", { name: "Diagrama siguiente" }).click();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText("Conectividad del piloto");
  await expect(dialog.getByLabel(/Diagrama 2 de 4/)).toBeVisible();
  await dialog.getByRole("button", { name: "Diagrama anterior" }).click();
  await expect(dialog.getByRole("heading", { level: 2 })).toHaveText("Arquitectura integral");
  await page.keyboard.press("0");
  await expect(scale).toHaveText(`${fitPercent}%`);
});

test("Escape restaura foco, posición y scroll del body", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  const trigger = page.locator(".diagram-card").nth(2).getByRole("button", { name: /Explorar diagrama/ });
  await trigger.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => scrollY);
  await trigger.click();
  await expect(page.locator("body")).toHaveCSS("position", "fixed");
  await expect(page.getByRole("button", { name: "Cerrar visor" })).toBeFocused();

  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
  expect(Math.abs((await page.evaluate(() => scrollY)) - scrollBefore)).toBeLessThanOrEqual(1);
});

for (const width of [360, 390] as const) {
  test(`el visor es utilizable y no desborda a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 360 ? 800 : 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("#arquitectura").scrollIntoViewIfNeeded();
    await page.locator(".diagram-card").first().getByRole("button", { name: /Explorar diagrama/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".viewer-viewport")).toHaveCSS("touch-action", "none");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();

    for (const name of ["Alejar", "Acercar", "Ajustar", "100%", "Diagrama anterior", "Diagrama siguiente", "Cerrar visor"]) {
      const box = await dialog.getByRole("button", { name, exact: true }).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
    }
    const before = await dialog.locator(".viewer-scale").textContent();
    await dialog.getByRole("button", { name: "Acercar" }).click();
    await expect(dialog.locator(".viewer-scale")).not.toHaveText(before ?? "");
    expect((await dialog.locator(".viewer-viewport").boundingBox())!.height).toBeGreaterThan(300);
  });
}
