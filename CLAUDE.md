# CLAUDE.md

Guía para trabajar en este repo. El contexto general (stack, instalación, variables de entorno) está en `README.md`.

## Flujo de trabajo

- Ramas `feat/...` o `fix/...` desde `main`. Nunca commitear ni pushear directo a `main`.
- Todo cambio entra por PR, con **Squash & Merge**.
- Mensajes y títulos de PR con **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`...).
- No deployar. El deploy no se hace desde aquí.
- No se mergea sin el CI (`verify`) en verde.
- **Un build verde no prueba que las páginas funcionen.** El fetching a Sanity, el routing de locales y los `notFound()` corren en cada request. Antes de dar un cambio por bueno: `npm run build`, `npm run start` y pedir las páginas afectadas (o correr el smoke test).
- Comentarios de código en inglés, mínimos, explicando el porqué y no el qué.

## Comandos

```bash
npm ci                          # instalar
npm run dev                     # desarrollo
npm run lint                    # eslint
npx tsc --noEmit                # typecheck
npm run build                   # build de producción
npm run start                   # sirve el build (puerto 3000)
node scripts/smoke-test.mjs     # smoke test contra un servidor ya levantado (default http://localhost:3000)
npm audit --audit-level=critical # umbral critical: ver issue #39
npm run sync                    # sincroniza content/ hacia Sanity
npm run lighthouse -- <url> --only=<grupos> # Lighthouse contra un servidor ya levantado (reportes en .lighthouseci/)
npm run report:lighthouse       # informe PDF completo, solo local (ver abajo)
```

El CI (`.github/workflows/ci.yml`) corre exactamente esta secuencia: `npm ci` → lint → tsc → build → `next start` + smoke test → audit.

`.github/workflows/lighthouse.yml` corre en paralelo a `verify` un único job, `lighthouse (blocking)`, que es check requerido: solo los grupos `blocking-*` y `notfound-mobile` (a11y, SEO y best practices del 404). Rendimiento y best practices de las páginas (`informative-*`) no corren en CI: se miden con `npm run report:lighthouse`, que siempre compila (`-- --no-build` reutiliza el `.next` existente), levanta `next start` en un puerto libre, corre todos los grupos y deja el PDF en `.lighthouse-report/lighthouse-report.pdf`. Solo se conserva el último informe, y se reemplaza únicamente si la corrida termina. Los grupos están en `scripts/lighthouse-groups.mjs`.

## Estructura relevante

- `src/app` no tiene root layout: cada árbol (`[locale]`, `studio`) tiene su propio layout con `<html>`. No añadir páginas sueltas en `src/app`, porque desde Next 16.4 el build falla sin root layout. `/` lo redirige `src/proxy.ts` (next-intl), no una página.
- Los locales válidos salen de `src/i18n/routing.ts`.

## Consumo del design system (`@abelardo-salazar/core-ui-design-system`)

- No ajustar alturas con `className`. Usar las props `size` y `shape` del componente.
- Los textos que exponen los componentes (props `xxxLabel`) salen de next-intl, nunca hardcodeados.
- Los locales de `/locale` del DS solo se pasan dentro de un componente cliente, nunca como prop desde un Server Component.
- Para filtros táctiles de conjuntos pequeños y fijos usar `Chip size="lg"`, no `Badge`. Para tags que crecen con el catálogo (como los de proyectos), usar `Combobox` con `multiple`.
