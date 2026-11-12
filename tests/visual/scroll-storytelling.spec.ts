import { expect, test } from "@playwright/test";

const moments = [0, 0.25, 0.5, 0.75, 1] as const;
const widths = [360, 390, 768, 1024, 1440] as const;

test("el recorrido produce cinco escenas distintas y la conexión une los nodos", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  const geometry = await page.locator("#recorrido").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    return { top: rect.top + scrollY, height: rect.height, viewport: innerHeight };
  });
  expect(geometry.height).toBeGreaterThanOrEqual(geometry.viewport * 4.9);

  const screenshots: Buffer[] = [];
  for (const [index, fraction] of moments.entries()) {
    await page.evaluate(
      ({ top, height, viewport, fraction }) => scrollTo(0, top + (height - viewport) * fraction),
      { ...geometry, fraction },
    );
    await page.waitForTimeout(120);

    const state = await page.locator("#recorrido").evaluate((section) => {
      const rail = section.querySelector<HTMLElement>(".journey-rail-line")!.getBoundingClientRect();
      const nodes = Array.from(section.querySelectorAll<HTMLElement>(".journey-node"), (node) => node.getBoundingClientRect());
      const panels = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-step]"));
      const titles = panels.map((panel) => panel.querySelector<HTMLElement>("h3")!.getBoundingClientRect());
      return {
        progress: Number(getComputedStyle(section).getPropertyValue("--journey-progress")),
        activeStage: Number((section as HTMLElement).dataset.activeStage),
        opacities: panels.map((panel) => Number(getComputedStyle(panel).opacity)),
        transforms: panels.map((panel) => getComputedStyle(panel).transform),
        lineToFirstNode: Math.abs(rail.left - (nodes[0].left + nodes[0].width / 2)),
        lineToLastNode: Math.abs(rail.right - (nodes.at(-1)!.left + nodes.at(-1)!.width / 2)),
        lineToNodeAxis: Math.max(...nodes.map((node) => Math.abs(rail.top + rail.height / 2 - (node.top + node.height / 2)))),
        lineOverlapsTitles: titles.some((title) => !(rail.right <= title.left || rail.left >= title.right || rail.bottom <= title.top || rail.top >= title.bottom)),
      };
    });

    expect(state.progress).toBeCloseTo(fraction, 1);
    expect(state.activeStage).toBe(index);
    expect(state.opacities[index]).toBeGreaterThan(0.95);
    expect(state.opacities.filter((opacity) => opacity > 0.1)).toHaveLength(1);
    expect(state.transforms[index]).not.toBe("none");
    expect(state.lineToFirstNode).toBeLessThan(1.5);
    expect(state.lineToLastNode).toBeLessThan(1.5);
    expect(state.lineToNodeAxis).toBeLessThan(1.5);
    expect(state.lineOverlapsTitles).toBeFalsy();
    screenshots.push(await page.screenshot());
  }

  for (let index = 1; index < screenshots.length; index += 1) {
    expect(Buffer.compare(screenshots[index - 1], screenshots[index])).not.toBe(0);
  }
});

for (const width of widths) {
  test(`recorrido responsive sin overflow ni cruces a ${width}px`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => message.type() === "error" && consoleErrors.push(message.text()));
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    await page.setViewportSize({ width, height: width <= 390 ? 780 : 900 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("#recorrido").scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    const stickyPosition = await page.locator(".journey-sticky").evaluate((node) => getComputedStyle(node).position);
    expect(stickyPosition).toBe(width >= 901 ? "sticky" : "static");

    if (width < 901) {
      const lineCrossesText = await page.locator("#recorrido").evaluate((section) => {
        const line = section.querySelector<HTMLElement>(".journey-mobile-line")!.getBoundingClientRect();
        return Array.from(section.querySelectorAll<HTMLElement>(".journey-stage-panel h3, .journey-stage-panel p"))
          .some((node) => {
            const text = node.getBoundingClientRect();
            return !(line.right <= text.left || line.left >= text.right || line.bottom <= text.top || line.top >= text.bottom);
          });
      });
      expect(lineCrossesText).toBeFalsy();
    }
    expect(consoleErrors).toEqual([]);
  });
}

test("hero, pilares, diagramas y métricas cambian visualmente con el scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  const readTransform = (selector: string) => page.locator(selector).first().evaluate((node) => {
    const matrix = new DOMMatrix(getComputedStyle(node).transform);
    return { scale: matrix.a, x: matrix.e, y: matrix.f, opacity: Number(getComputedStyle(node).opacity) };
  });

  const heroStart = await readTransform(".hero-title-scroll");
  await page.evaluate(() => scrollTo(0, 420));
  await page.waitForTimeout(100);
  const heroEnd = await readTransform(".hero-title-scroll");
  const artEnd = await readTransform(".hero-art-scroll");
  expect(heroEnd.y).toBeLessThan(heroStart.y - 45);
  expect(heroEnd.scale).toBeLessThan(0.96);
  expect(artEnd.scale).toBeGreaterThan(1.02);

  const stack = page.locator("[data-scroll-progress='stack']");
  const stackTop = await stack.evaluate((node) => node.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y), stackTop + 700);
  await page.waitForTimeout(100);
  await expect(page.locator("[data-stack-current]")).toHaveCount(1);
  const cardTransforms = await page.locator("[data-stack-card]").evaluateAll((cards) => cards.map((card) => getComputedStyle(card).transform));
  expect(new Set(cardTransforms).size).toBeGreaterThan(1);

  const diagram = page.locator("[data-diagram-scroll]").first();
  await diagram.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(700);
  const diagramState = await readTransform("[data-diagram-scroll]");
  expect(diagramState.opacity).toBeGreaterThan(0.7);
  expect(diagramState.scale).toBeGreaterThan(0.96);

  const metrics = page.locator(".metrics-section");
  await metrics.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1_250);
  const metricScale = await page.locator(".metric-track span").first().evaluate((node) => new DOMMatrix(getComputedStyle(node).transform).a);
  expect(metricScale).toBeGreaterThan(0.8);
  await expect(page.locator("[data-counter='108000']")).toHaveText("108.000");
});

test("reduced motion conserva todo el contenido sin escena sticky", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/motion-static/);
  await expect(page.locator("[data-journey-step]")).toHaveCount(5);
  const states = await page.locator("[data-journey-step]").evaluateAll((steps) => steps.map((step) => ({
    opacity: getComputedStyle(step).opacity,
    transform: getComputedStyle(step).transform,
    position: getComputedStyle(step).position,
  })));
  expect(states.every((state) => state.opacity === "1" && state.transform === "none" && state.position === "relative")).toBeTruthy();
  expect(await page.locator(".journey-sticky").evaluate((node) => getComputedStyle(node).position)).toBe("relative");
});
