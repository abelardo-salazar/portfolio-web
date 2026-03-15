import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Separator,
} from "@/components/ui/ui-wrapper";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import {
  ProjectChallenges,
  ProjectFeatures,
} from "@/components/projects/ProjectDetails";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { getProjects, getProjectBySlug } from "@/sanity/lib/api";

interface ProjectPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getProjects();
  const locales = ["en", "es"];

  return locales.flatMap((locale) =>
    projects.map((project) => ({
      locale,
      slug: project.slug,
    })),
  );
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug, locale } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title[locale as "es" | "en"]} | Proyectos`,
    description: project.description[locale as "es" | "en"],
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug, locale } = await params;
  const project = await getProjectBySlug(slug);
  const t = await getTranslations({ locale, namespace: "Projects" });

  if (!project) notFound();

  const l = locale as "es" | "en";

  return (
    <main className="min-h-screen pt-32 pb-20">
      <Container size="md">
        <Link
          href={`/${locale}/projects`}
          className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t("backToProjects")}
        </Link>

        <div className="space-y-6 mb-12">
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {project.year}
            </Badge>
            <div className="flex gap-3">
              {project.github && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={project.github} target="_blank">
                    <Github className="w-5 h-5" />
                  </a>
                </Button>
              )}
              {project.link && (
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={project.link} target="_blank">
                    {t("visitLive")} <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Heading level="h1" className="text-4xl md:text-6xl font-extrabold">
            {project.title[l]}
          </Heading>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <ProjectGallery images={project.images} />
        <Separator className="my-10" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-8">
            <section>
              <Heading level="h3" className="mb-4 text-xl">
                {t("overview")}
              </Heading>
              <Text size="lg" className="leading-relaxed text-base-content/80">
                {project.description[l]}
              </Text>
            </section>

            {project.features && (
              <ProjectFeatures
                title={t("keyFeatures")}
                items={project.features[l]}
              />
            )}

            {project.challenges && (
              <ProjectChallenges
                title={t("technicalChallenges")}
                items={project.challenges[l]}
              />
            )}
          </div>

          <aside className="space-y-6">
            <div className="p-6 rounded-2xl bg-base-content/5 border border-base-content/10">
              <Heading
                level="h4"
                className="text-sm uppercase tracking-widest text-primary font-bold mb-4"
              >
                {t("technologies")}
              </Heading>
              <ul className="space-y-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
