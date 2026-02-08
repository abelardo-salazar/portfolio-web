"use client";
import { Project } from "@/types/data";
import { useLocale } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../MotionReveal";

export const ProjectCard = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const locale = useLocale() as "es" | "en";

  return (
    <MotionReveal delay={index * 0.1}>
      <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-base-content/50">
              {project.year}
            </span>
            {project.featured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <CardTitle>{project.title[locale]}</CardTitle>
          <CardDescription>{project.description[locale]}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" fullWidth asChild>
            <a href={project.link || project.github}>Ver más</a>
          </Button>
        </CardContent>
      </Card>
    </MotionReveal>
  );
};
