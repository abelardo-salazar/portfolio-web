"use client";

import {
  Button,
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../MotionReveal";
import { ProjectCard } from "../projects/ProjectCard";
import { PROJECTS } from "@/data/projects";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

export const ProjectSection = () => {
  const t = useTranslations("Projects.home");
  const locale = useLocale() as "es" | "en";
  return (
    <section id="projects" className="py-10 md:py-32 scroll-mt-20">
      <Container size="lg">
        <MotionReveal>
          <div className="mb-12">
            <Heading level="h2" className="mb-4">
              {t("title")}
            </Heading>
            <Text size="lead">{t("description")}</Text>
          </div>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map(
            (project, index) =>
              project.featured && (
                <ProjectCard
                  key={index}
                  project={project}
                  index={index}
                  locale={locale}
                />
              ),
          )}
        </div>
        <div className="flex justify-center pt-8">
          <Button variant="outline" size="lg" className="px-8" asChild>
            <Link href={`/${locale}/projects`}>{t("viewAll")}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
};
