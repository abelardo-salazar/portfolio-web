"use client";
import { ContactSection } from "@/components/HomeSections/ContactSection";
import { ExperienceSection } from "@/components/HomeSections/ExperienceSection";
import { HeroSection } from "@/components/HomeSections/HeroSection";
import { ProjectSection } from "@/components/HomeSections/ProjectSection";
import { siteConfig } from "@/config/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    jobTitle: "Senior Frontend Engineer",
    sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
    knowsAbout: siteConfig.keywords,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-base-100">
        <HeroSection />
        <ExperienceSection />
        <ProjectSection />
        <ContactSection />
      </main>
    </>
  );
}
