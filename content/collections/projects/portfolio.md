---
_id: project-portfolio-2026
_type: project
slug: portfolio-personal-2026
year: "2026"
startDate: "2026-01-18"
featured: true
link: "https://portfolio-web-rouge-tau.vercel.app"
tags:
  - Next.js 16
  - React 19
  - TypeScript
  - Tailwind CSS v4
  - Sanity
  - next-intl
  - Zod
  - Core UI
title_es: "Portfolio Personal & CMS"
title_en: "Personal Portfolio & CMS"
features_es:
  - "Portfolio bilingüe (español/inglés) con Next.js App Router, Server Components y next-intl."
  - "Contenido como código: archivos Markdown y YAML sincronizados con Sanity mediante un script propio de Node.js."
  - "Revalidación por webhook: Sanity avisa los cambios y la página actualiza solo el contenido afectado, con caché por tags."
  - "Formulario de contacto con React Hook Form y Zod, validado también en el servidor con una Server Action y enviado con Resend."
  - "Interfaz construida con Core UI, mi design system, instalado como paquete privado desde GitHub Packages."
features_en:
  - "Bilingual (Spanish/English) portfolio built with the Next.js App Router, Server Components, and next-intl."
  - "Content as code: Markdown and YAML files synced to Sanity through my own Node.js script."
  - "Webhook-driven revalidation: Sanity reports changes and the site refreshes only the affected content, using tag-based caching."
  - "Contact form with React Hook Form and Zod, also validated on the server through a Server Action and sent with Resend."
  - "UI built with Core UI, my design system, installed as a private package from GitHub Packages."
challenges_es:
  - "Resolví en el script de sincronización las restricciones de la API de Sanity: generar `_key` únicos, transformar campos planos en objetos anidados y separar el contenido bilingüe de cada archivo."
  - "Protegí el endpoint de revalidación verificando la firma HMAC del webhook antes de confiar en su contenido, y revalidando por tag en lugar de toda la caché."
  - "En una auditoría posterior detecté que el email de contacto insertaba los datos del usuario sin escapar. Aprendí a distinguir validar la entrada de codificar la salida."
  - "Un locale fuera de es/en rompía la página en producción. Tras corregirlo, la lección fue preguntarme siempre \"¿qué pasa si no llega lo que espero?\", no solo resolver el camino feliz."
challenges_en:
  - "Handled the Sanity API's constraints in the sync script: generating unique `_key` values, turning flat fields into nested objects, and splitting each file's bilingual content."
  - "Secured the revalidation endpoint by verifying the webhook's HMAC signature before trusting its payload, and revalidating by tag instead of the whole cache."
  - "A later audit found that the contact email inserted user input without escaping it. I learned to separate validating input from encoding output."
  - "A locale outside es/en broke the page in production. After fixing it, the lesson was to always ask \"what if I don't get what I expect?\", not just solve the happy path."
---

## es

Mi portfolio personal, construido de punta a punta con Next.js 16 y Sanity como CMS headless. El contenido vive en archivos Markdown y YAML dentro del repositorio y se sincroniza con Sanity mediante un script propio, y la interfaz usa Core UI, mi design system. Después del lanzamiento hice una auditoría con agentes de IA para eliminar código muerto y cerrar brechas de robustez y seguridad, verificando cada cambio contra el repositorio y el sitio en producción.

## en

My personal portfolio, built end to end with Next.js 16 and Sanity as a headless CMS. Content lives in Markdown and YAML files in the repository and syncs to Sanity through my own script, and the UI uses Core UI, my design system. After launch, I ran an audit with AI agents to remove dead code and close robustness and security gaps, verifying every change against the repository and the live site.
