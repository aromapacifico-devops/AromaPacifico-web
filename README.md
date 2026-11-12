# AromaPacífico — Sitio web

Sitio institucional de presentación de la propuesta académica **AromaPacífico**, construido con **Next.js (App Router), React, TypeScript y CSS**. Su objetivo es comunicar el alcance del proyecto, explicar el recorrido del café y presentar las tres experiencias del diseño (caficultor, transportador y comprador).

> **Alcance:** este repositorio es una web estática de comunicación. No incluye backend, autenticación, consumo de AWS, mapas operacionales ni datos reales de sacos. La consulta incluida en la página es **una demostración con datos ficticios**. No implica que la infraestructura del proyecto esté desplegada.

## Ejecutar localmente

Requisitos: Node.js **22** y npm. Next.js requiere al menos Node 20.9.

```bash
npm install
npm run dev
```

Visita <http://localhost:3000>.

### Comprobar

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

`next.config.ts` habilita la exportación estática (`output: "export"`). `npm run build` produce `out/`, compatible con hosting estático y Vercel.

## Crear repositorio nuevo en GitHub

Desde la raíz de esta carpeta, con GitHub CLI autenticado y autorización para crear repositorios en la organización:

```bash
git init -b main
git add .
git commit -m "feat(web): bootstrap AromaPacifico institutional site"
gh repo create aromapacifico-devops/aromapacifico-web --public --source=. --remote=origin --push
```

**Alternativa:** si no tienes permisos de creación en la organización, crea el repositorio desde GitHub con el nombre `aromapacifico-web` y luego configura el remoto manualmente. No fuerces ningún push existente.

### Despliegue en Vercel

1. Importa `aromapacifico-devops/aromapacifico-web` en Vercel (o tu fork).
2. Framework: Next.js; no requiere base de datos ni secretos AWS.
3. Establece `NEXT_PUBLIC_SITE_URL` con la URL pública de la web para los metadatos.
4. Ejecuta un deployment desde el repositorio. **Este despliegue es solo de la web pública, no de infraestructura AWS ni Terraform**.

Si se decide que el alcance académico también prohíbe publicar cualquier web externa, conserva el proyecto en local y no lo despliegues.

## Branding y contenidos

Se ha seguido la identidad documentada en:

- [`visual-identity.md`](https://github.com/aromapacifico-devops/aromapacifico-devops-docs/blob/main/docs/design/visual-identity.md)
- [`design-system.md`](https://github.com/aromapacifico-devops/aromapacifico-devops-docs/blob/main/docs/design/design-system.md)
- [Branding PDF](https://github.com/aromapacifico-devops/aromapacifico-devops-docs/blob/main/docs/design/aroma-pacifico-branding.pdf)
- [Figma original](https://www.figma.com/design/sFAlRb7c5pxXKsQK7ZRub0/AromaPacifico)

Los colores principales son `#8C0303`, `#0378A6`, `#F29F05` y el fondo `#FBF9F5`. Se emplean las familias Outfit y Roboto Mono, con fuentes de sistema como fallback. El emblema SVG en `public/brand/aroma-mark.svg` **es una recreación estilizada**, no el archivo maestro del logotipo en Figma. Antes de publicar comercialmente, sustituye el emblema por el SVG aprobado/exportado del componente `Logo/Principal`.

Las pantallas en las tarjetas son recreaciones simplificadas en CSS, no capturas del diseño original. Los prototipos PDF originales están enlazados desde las tarjetas.

## Estructura

```text
src/app/page.tsx             Página pública y secciones
src/app/globals.css          Diseño responsive y tokens visuales
src/app/layout.tsx           Layout y metadatos SEO
src/components/header.tsx    Navegación móvil
src/components/trace-demo.tsx Consulta interactiva de demostración
src/components/logo.tsx      Marca
src/content/site.ts         Textos, enlaces y recorrido
public/brand                 Emblema vectorial ilustrativo
public/illustrations         Ilustración original de montañas
```

## Siguiente fase (separada de esta entrega)

- Sustituir el logotipo SVG por el arte oficial exportado desde Figma.
- Validar copy y versiones del diseño con el equipo.
- Incorporar los mockups definitivos a medida que el diseño esté aprobado.
- Crear aplicaciones funcionales independientes únicamente cuando existan requisitos y backends reales; no conectar el formulario ficticio a servicios de producción.

## Autoría y uso

Proyecto académico de AromaPacífico. Los contenidos técnicos y datos del caso provienen de la documentación de la organización; la web es una nueva propuesta de implementación visual.

## Integración continua

`.github/workflows/ci.yml` ejecuta pruebas, ESLint, TypeScript y build en cada PR/push. El workflow está incluido como configuración inicial, pero **no se ha ejecutado ni validado en GitHub**. Después de `npm install`, versiona también el `package-lock.json` que genere npm; entonces se puede cambiar el workflow a `npm ci` para instalaciones reproducibles.
