import { AboutSection } from "@/components/HomeSections/AboutSection";
import { ContactSection } from "@/components/HomeSections/ContactSection";
import { ExperienceSection } from "@/components/HomeSections/ExperienceSection";
import { HeroSection } from "@/components/HomeSections/HeroSection";
import { ProjectSection } from "@/components/HomeSections/ProjectSection";
import { SkillsSection } from "@/components/HomeSections/SkillsSection";
import { siteConfig } from "@/config/site";
import {
  getExperiences,
  getFeaturedProjects,
  getProfile,
  getSkills,
} from "@/sanity/lib/api";

export default async function Home() {
  const [experiences, featuredProjects, skills, profile] = await Promise.all([
    getExperiences(),
    getFeaturedProjects(),
    getSkills(),
    getProfile(),
  ]);
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
        <AboutSection profile={profile} />
        <ExperienceSection experiences={experiences} />
        <SkillsSection skills={skills} />
        <ProjectSection projects={featuredProjects} />
        <ContactSection />
      </main>
    </>
  );
}
