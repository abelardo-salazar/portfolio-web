"use client";
import { Project } from "@/types/data";
import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";

interface ProjectCardProps {
  project: Project;
  index: number;
  locale: "es" | "en";
}

export const ProjectCard = ({ project, index, locale }: ProjectCardProps) => {
  const t = useTranslations("Projects");

  return (
    <MotionReveal delay={index * 0.1}>
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader className="flex-grow">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-base-content mb-8">
              {project.year}
            </span>
            {project.featured && (
              <Badge variant="secondary">{t("featured")}</Badge>
            )}
          </div>
          <CardTitle>{project.title[locale]}</CardTitle>
          <CardDescription>{project.description[locale]}</CardDescription>
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
          <Button variant="primary" size="sm" fullWidth asChild>
            <a
              aria-label={`${t("more")} ${project.title[locale]}`}
              href={`/${locale}/projects/${project.slug}`}
            >
              {t("more")}
            </a>
          </Button>
        </CardContent>
      </Card>
    </MotionReveal>
  );
};
