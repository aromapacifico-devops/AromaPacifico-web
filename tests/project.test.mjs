import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

const diagramFiles = [
  "01-end-to-end.drawio.png",
  "03-connectivity-and-centers.drawio.png",
  "19-inference-functions.drawio.png",
  "21-flight-object-transport.drawio.png",
];

test("la demostración se identifica como ficticia y no consume APIs", () => {
  const demo = read("src/components/trace-demo.tsx");
  assert.match(demo, /DEMO · DATOS FICTICIOS/);
  assert.match(demo, /no está conectada a datos reales/);
  assert.match(demo, /No representan sacos, fincas ni movimientos reales/);
  assert.match(demo, /No se está consultando ningún servicio externo/);

  for (const file of ["src/app/page.tsx", "src/components/trace-demo.tsx", "src/content/site.ts"]) {
    const content = read(file);
    assert.doesNotMatch(content, /fetch\(|axios\.|amazonaws\.com|process\.env\.AWS_/);
  }
});

test("los cuatro diagramas oficiales existen localmente y son PNG válidos", () => {
  for (const name of diagramFiles) {
    const file = path.join(root, "public", "architecture", name);
    assert.ok(fs.existsSync(file), name);
    const signature = fs.readFileSync(file).subarray(0, 8).toString("hex");
    assert.equal(signature, "89504e470d0a1a0a", `${name} no tiene firma PNG`);
    assert.ok(fs.statSync(file).size > 50_000, `${name} parece incompleto`);
  }
});

test("los metadatos de diagramas son completos, únicos y trazables", () => {
  const content = read("src/content/site.ts");
  assert.match(content, /docs\/architecture\/diagrams/);
  for (const name of diagramFiles) {
    assert.match(content, new RegExp(`/architecture/${name.replaceAll(".", "\\.")}`));
    assert.ok(content.includes(`source: \`\${diagramBase}/${name}\``), name);
  }
  const diagramContent = content.slice(content.indexOf("export const diagrams"));
  const numbers = [...diagramContent.matchAll(/number: "(01|03|19|21)"/g)].map((match) => match[1]);
  assert.deepEqual(numbers, ["01", "03", "19", "21"]);
});

test("la navegación enlaza las secciones implementadas", () => {
  const page = read("src/app/page.tsx");
  const header = read("src/components/header.tsx");
  for (const id of ["plataforma", "recorrido", "arquitectura", "experiencias", "consulta"]) {
    assert.match(`${page}\n${read("src/components/architecture/architecture-section.tsx")}\n${read("src/components/trace-demo.tsx")}`, new RegExp(`id="${id}"`));
    assert.match(`${header}\n${page}`, new RegExp(`#${id}`));
  }
  assert.match(header, /aria-current/);
  assert.match(header, /aria-expanded/);
  assert.match(page, /Saltar al contenido/);
});

test("el visor expone controles accesibles y gestión de teclado", () => {
  const viewer = read("src/components/architecture/diagram-viewer.tsx");
  for (const token of ["aria-modal=\"true\"", "role=\"dialog\"", "Escape", "Cerrar visor", "Ajustar", "Acercar", "Alejar"]) {
    assert.ok(viewer.includes(token), token);
  }
  assert.match(viewer, /event\.key === "Tab"/);
  assert.match(viewer, /setPointerCapture/);
});

test("el movimiento respeta reduced motion y evita ocultar contenido sin JavaScript", () => {
  const css = read("src/app/globals.css");
  const controller = read("src/components/motion-controller.tsx");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.motion-ready \[data-reveal\]/);
  assert.match(controller, /prefers-reduced-motion: reduce/);
  assert.match(controller, /IntersectionObserver/);
  assert.doesNotMatch(css, /(^|\n)\[data-reveal\]\{opacity:0/);
});

test("el branding oficial y los colores institucionales están integrados", () => {
  assert.ok(exists("public/brand/aroma-pacifico-logo.png"));
  assert.match(read("src/components/logo.tsx"), /aroma-pacifico-logo\.png/);
  const css = read("src/app/globals.css");
  for (const color of ["#8C0303", "#0378A6", "#F29F05", "#FBF9F5", "#161412"]) {
    assert.ok(css.toLowerCase().includes(color.toLowerCase()), color);
  }
});

test("el proyecto sigue siendo una exportación estática sin backend", () => {
  assert.match(read("next.config.ts"), /output: "export"/);
});
