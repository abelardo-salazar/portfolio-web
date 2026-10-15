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
npm ci                          # instalar (requiere GITHUB_NPM_TOKEN, ver README)
npm run dev                     # desarrollo
npm run lint                    # eslint
npx tsc --noEmit                # typecheck
npm run build                   # build de producción
npm run start                   # sirve el build (puerto 3000)
node scripts/smoke-test.mjs     # smoke test contra un servidor ya levantado (default http://localhost:3000)
npm audit --audit-level=critical
npm run sync                    # sincroniza content/ hacia Sanity
```

El CI (`.github/workflows/ci.yml`) corre exactamente esta secuencia: `npm ci` → lint → tsc → build → `next start` + smoke test → audit.

## Estructura relevante

- `src/app` no tiene root layout: cada árbol (`[locale]`, `studio`) tiene su propio layout con `<html>`. No añadir páginas sueltas en `src/app`, porque desde Next 16.4 el build falla sin root layout. `/` lo redirige `src/proxy.ts` (next-intl), no una página.
- Los locales válidos salen de `src/i18n/routing.ts`.

## Consumo del design system (`@abelardo-salazar/core-ui-design-system`)

- No ajustar alturas con `className`. Usar las props `size` y `shape` del componente.
- Los textos que exponen los componentes (props `xxxLabel`) salen de next-intl, nunca hardcodeados.
- Los locales de `/locale` del DS solo se pasan dentro de un componente cliente, nunca como prop desde un Server Component.
- Para filtros táctiles usar `Chip size="lg"`, no `Badge`.

## Deuda conocida

- `npm audit` usa umbral `critical` porque las vulnerabilidades high vienen de `sanity` v4 y solo se arreglan con Sanity 6. **Al migrar a Sanity 6, subir el umbral a `high`** en el CI y en esta guía.
