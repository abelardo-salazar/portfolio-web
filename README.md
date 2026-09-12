# Portfolio Web

Portafolio personal de Abelardo Salazar. Next.js 16 (App Router, Server Components), i18n (es/en) con `next-intl`, contenido gestionado en Sanity CMS con un flujo "content-as-code" (`content/`), y UI construida sobre el design system privado `@abelardo-salazar/core-ui-design-system`.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **next-intl** — i18n, locales `es`/`en`
- **Sanity CMS** (`sanity`, `next-sanity`, `@sanity/client`) — Studio embebido en `/studio`
- **@abelardo-salazar/core-ui-design-system** — paquete privado (GitHub Packages)
- **Resend** — envío del formulario de contacto

## Requisitos previos

- Node.js (LTS)
- Un [Personal Access Token de GitHub](https://github.com/settings/tokens) con permiso `read:packages`, para instalar el paquete privado del design system.

## Instalación

1. Cloná el repo.
2. Configurá el token de GitHub Packages como variable de entorno antes de instalar — `.npmrc` ya apunta `@abelardo-salazar` al registro de GitHub y espera `GITHUB_NPM_TOKEN`:

   ```bash
   export GITHUB_NPM_TOKEN=ghp_xxxxxxxxxxxx   # o el equivalente en tu shell
   ```

3. Instalá dependencias:

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
| `SANITY_WRITE_TOKEN` | Token con permiso de escritura, usado por `npm run sync` para sincronizar `content/` hacia Sanity |
| `SANITY_REVALIDATE_SECRET` | Secreto compartido con el webhook de Sanity; valida la firma en `/api/revalidate` |
| `RESEND_API_KEY` | API key de Resend para el envío del formulario de contacto |

## Scripts

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # eslint
npm run sync    # sincroniza content/ (Markdown/YAML) hacia el dataset de Sanity
```

## `styled-components`: por qué es dependencia directa

`styled-components` está en `dependencies` aunque la app **no** usa CSS-in-JS — todo el estilado de la app pasa por Tailwind y el design system. Es **peer dependency obligatoria** de la pila de Sanity Studio embebido en `/studio`: `next-sanity`, `sanity`, `@sanity/ui`, `@sanity/vision` y `@sanity/visual-editing` la requieren para renderizar la UI del Studio. Al no declararla explícita, `npm install` la resolvería solo como transitiva — lo cual, combinado con `legacy-peer-deps=true` (ver arriba), puede dejarla en una versión que el resolver eligió por conveniencia y no una que el equipo controla. Se fija explícita en `package.json` para tener control de versión directo sobre algo de lo que `/studio` depende en runtime.
