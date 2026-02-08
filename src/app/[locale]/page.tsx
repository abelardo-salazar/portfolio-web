"use client";
import { ContactSection } from "@/components/ContactSection";
import { HeroSection } from "@/components/HeroSection";
import { ProjectSection } from "@/components/ProjectSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100">
      <HeroSection />
      <ProjectSection />
      <ContactSection />
    </main>
  );
}
