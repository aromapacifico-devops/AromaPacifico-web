import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (f) => fs.readFileSync(path.join(root,f), 'utf8');

test('La demostración es identificada como ficticia', () => {
  const code = read('src/components/trace-demo.tsx');
  assert.match(code, /DEMO · DATOS FICTICIOS/);
  assert.match(code, /no está conectada a datos reales/);
  assert.match(code, /No representan sacos, fincas ni movimientos reales/);
});
test('No existen llamadas de la página a endpoints de AWS o APIs reales', () => {
  for (const file of ['src/app/page.tsx','src/components/trace-demo.tsx','src/content/site.ts']){
    const content = read(file);
    assert.doesNotMatch(content,/fetch\(|axios\.|amazonaws\.com|process\.env\.AWS_/);
  }
});
test('Secciones principales y branding', () => {
  const page = read('src/app/page.tsx');
  for (const id of ['plataforma','recorrido','experiencias']) assert.match(page,new RegExp(`id="${id}"`));
  assert.match(read('src/components/trace-demo.tsx'),/id="consulta"/);
  const css = read('src/app/globals.css');
  for (const color of ['#8C0303','#0378A6','#F29F05','#FBF9F5']) assert.ok(css.toLowerCase().includes(color.toLowerCase()), color);
});
test('Proyecto exportable sin backend', () => {
  const config = read('next.config.ts');
  assert.match(config,/output: "export"/);
});
