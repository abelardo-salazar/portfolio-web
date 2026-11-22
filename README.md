# Portfolio Web

Portafolio personal de Abelardo Salazar. Next.js 16 (App Router, Server Components), i18n (es/en) con `next-intl`, contenido gestionado en Sanity CMS con un flujo "content-as-code" (`content/`), y UI construida sobre el design system `@abelardo-salazar/core-ui-design-system`.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **next-intl** — i18n, locales `es`/`en`
- **Sanity CMS** (`sanity`, `next-sanity`, `@sanity/client`) — Studio embebido en `/studio`
- **@abelardo-salazar/core-ui-design-system** — paquete público en npm
- **Resend** — envío del formulario de contacto
- **Tailwind CSS** — estilado de la app
- **styled-components** — solo para Sanity Studio; ver [por qué es dependencia directa](#styled-components-por-qué-es-dependencia-directa)
- **react-hook-form + zod** — formulario de contacto; el mismo esquema de zod valida en cliente y servidor

## Requisitos previos

- Node.js 22.19 o superior (lo exigen `lighthouse` y `@lhci/cli`, que usan los scripts de Lighthouse)

## Instalación

1. Cloná el repo.
2. Instalá dependencias:

   ```bash
   npm install
   ```

   > `.npmrc` incluye `legacy-peer-deps=true`. Es necesario porque el árbol de `peerDependencies` de Sanity (`sanity`, `next-sanity`, `@sanity/ui`, `@sanity/vision`, `@sanity/visual-editing`) no resuelve limpio con el resolver estricto de npm 7+ tal como está versionado hoy — sin esta bandera, `npm install` falla con `ERESOLVE`.

## Variables de entorno

Variables esperadas en `.env.local` (no versionado):

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID del proyecto de Sanity (cliente de la app y Studio) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset de Sanity a consultar |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Opcional. Versión de la API por defecto de la herramienta Vision del Studio; si falta, usa la de `src/sanity/env.ts`. El cliente de la app no la lee |
| `SANITY_WRITE_TOKEN` | Token con permiso de escritura, usado por `npm run sync` para sincronizar `content/` hacia Sanity |
| `SANITY_REVALIDATE_SECRET` | Secreto compartido con el webhook de Sanity; valida la firma en `/api/revalidate` |
| `RESEND_API_KEY` | API key de Resend para el envío del formulario de contacto |
| `CONTACT_EMAIL` | Dirección que recibe los mensajes del formulario de contacto. Solo se lee en el servidor; si falta, el formulario devuelve un error genérico y el servidor registra la causa |

## Scripts

```bash
npm run dev               # servidor de desarrollo
npm run build             # build de producción
npm run start             # sirve el build de producción
npm run lint              # eslint
npm run sync              # sincroniza content/ (Markdown/YAML) hacia el dataset de Sanity
npm run lighthouse        # Lighthouse CI contra un servidor ya levantado (por defecto http://localhost:3000)
npm run report:lighthouse # informe PDF completo de Lighthouse
npm run lighthouse:pdf    # genera un PDF a partir de resultados ya medidos (por defecto, los de .lighthouseci/)
```

`report:lighthouse` compila por defecto (`npm run report:lighthouse -- --no-build` reutiliza el `.next` existente), sirve el build con `next start` en un puerto libre, mide todos los grupos y escribe el informe en `.lighthouse-report/`. Solo se conserva el último informe, y se reemplaza únicamente si la corrida termina. `lighthouse:pdf` es el paso interno que genera ese PDF; a mano solo hace falta para rehacer un PDF sin volver a medir.

## `styled-components`: por qué es dependencia directa

`styled-components` está en `dependencies` aunque la app **no** usa CSS-in-JS — todo el estilado de la app pasa por Tailwind y el design system. Es **peer dependency obligatoria** de la pila de Sanity Studio embebido en `/studio`: `next-sanity`, `sanity`, `@sanity/ui`, `@sanity/vision` y `@sanity/visual-editing` la requieren para renderizar la UI del Studio. Al no declararla explícita, `npm install` la resolvería solo como transitiva — lo cual, combinado con `legacy-peer-deps=true` (ver arriba), puede dejarla en una versión que el resolver eligió por conveniencia y no una que el equipo controla. Se fija explícita en `package.json` para tener control de versión directo sobre algo de lo que `/studio` depende en runtime.
