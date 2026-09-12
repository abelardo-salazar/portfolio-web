import Link from "next/link";

// Root-level boundary (outside [locale]). Reached when notFound() is thrown
// from src/app/[locale]/layout.tsx itself — e.g. an invalid locale segment
// like /fr/ — so there's no resolved locale/messages to localize this with.
// Kept bilingual and dependency-free on purpose.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ margin: 0 }}>Page not found / Página no encontrada</p>
      <Link href="/es" style={{ textDecoration: "underline" }}>
        Volver al inicio / Back home
      </Link>
    </div>
  );
}
