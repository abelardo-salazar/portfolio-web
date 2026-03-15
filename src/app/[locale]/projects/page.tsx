import { ProjectBrowser } from "@/components/projects/ProjectBrowser";
import { getProjects } from "@/sanity/lib/api";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Projects" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <main className="min-h-screen bg-base-100 mt-4">
      <ProjectBrowser projects={projects} />
    </main>
  );
}
