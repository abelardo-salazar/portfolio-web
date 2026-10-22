---
_id: project-core-ui-design-system
_type: project
slug: core-ui-design-system
year: "2026"
featured: true
tags:
  - React 19
  - TypeScript
  - Tailwind CSS v4
  - Radix UI
  - Vite
  - Storybook
  - Vitest
  - GitHub Actions
title_es: "Core UI: Sistema de Diseño y Librería de Componentes"
title_en: "Core UI: Design System and Component Library"
features_es:
  - "Componentes accesibles sobre primitivas de Radix UI y cmdk: Combobox, ToggleGroup, Tabs, Dialog, Popover, Sheet, selector de fechas y más."
  - "Textos configurables por prop y un subpath de locales, para usar la librería en cualquier idioma."
  - "Utilidades de accesibilidad para anunciar cambios a lectores de pantalla (announce, VisuallyHidden)."
  - "Empaquetado con Vite en Library Mode (ESM, preserveModules, tres entradas) con tree-shaking real para los consumidores."
  - "Versionado semántico y publicación en GitHub Packages mediante GitHub Actions, probado con una app Next.js como consumidor."
  - "Desarrollado dirigiendo agentes de IA con PRs chicos (#37–#59), verificación en cada entrega y decisión humana en acciones irreversibles como publicar."
features_en:
  - "Accessible components built on Radix UI and cmdk primitives: Combobox, ToggleGroup, Tabs, Dialog, Popover, Sheet, a date picker, and more."
  - "Prop-configurable text and a locales subpath, so the library works in any language."
  - "Accessibility utilities to announce changes to screen readers (announce, VisuallyHidden)."
  - "Vite Library Mode bundling (ESM, preserveModules, three entries) with real tree-shaking for consumers."
  - "Semantic versioning and publishing to GitHub Packages via GitHub Actions, tested against a Next.js consumer app."
  - "Built by directing AI coding agents through small PRs (#37–#59), with verification at every handoff and a human decision on irreversible actions such as publishing."
challenges_es:
  - "Detecté que el paquete no declaraba `sideEffects`, lo que anulaba el tree-shaking: importar solo `Button` sumaba ~270 kB. Declararlo lo bajó a ~33 kB."
  - "Una página de Next.js compilaba pero respondía 500: un locale con funciones pasaba de un Server Component a un Client Component. Lo resolví respetando los límites de serialización de RSC."
  - "Revisé el código fuente de cmdk y Radix para entender sus decisiones de ARIA y corregir la experiencia con lector de pantalla en Combobox y ToggleGroup."
  - "Reproduje un test intermitente retrasando a propósito la respuesta del servidor de Vitest antes de corregirlo, en vez de parchearlo a ciegas."
  - "Mergear tres PRs antes de su revisión dejó una regresión de accesibilidad en `main`. La lección: esperar el veredicto antes de mergear y exigir que cada verificación se ejecute de verdad."
challenges_en:
  - "Found that the package didn't declare `sideEffects`, which disabled tree-shaking: importing only `Button` added ~270 kB. Declaring it brought that down to ~33 kB."
  - "A Next.js page built successfully but returned 500: a locale containing functions was passed from a Server Component to a Client Component. Fixed it by respecting RSC serialization boundaries."
  - "Read cmdk's and Radix's source to understand their ARIA decisions and fix the screen-reader experience in Combobox and ToggleGroup."
  - "Reproduced a flaky test by deliberately delaying the Vitest server's response before fixing it, instead of patching it blindly."
  - "Merging three PRs before review left an accessibility regression on `main`. The lesson: wait for the verdict before merging, and require every verification to actually run."
---

## es

Core UI es mi librería de componentes en React 19, TypeScript y Tailwind CSS v4, publicada como paquete versionado en GitHub Packages y consumida por este portfolio. En la versión 0.5.0 agregué seis piezas nuevas (entre ellas Combobox, ToggleGroup y un Input con botón para limpiar), textos configurables y soporte de locales, y corregí bugs de la versión anterior en accesibilidad, theming, SSR y empaquetado. Fue donde aprendí a leer el código de las librerías headless antes de confiar en su accesibilidad, y a no dar un cambio por bueno hasta haberlo verificado en un consumidor real.

## en

Core UI is my component library in React 19, TypeScript, and Tailwind CSS v4, published as a versioned package on GitHub Packages and consumed by this portfolio. In version 0.5.0 I added six new pieces (including a Combobox, a ToggleGroup, and a clearable Input), configurable text and locale support, and fixed bugs from the previous release in accessibility, theming, SSR, and bundling. It's where I learned to read headless libraries' source before trusting their accessibility, and not to consider a change done until I'd verified it in a real consumer.
