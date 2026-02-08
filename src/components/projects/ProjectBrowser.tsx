"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
  Input,
  Badge,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { PROJECTS } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { Search, X } from "lucide-react";

export const ProjectBrowser = () => {
  const t = useTranslations("Projects");
  const locale = useLocale() as "es" | "en";
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = PROJECTS.flatMap((p) => p.tags);
    return Array.from(new Set(tags));
  }, []);

  const filteredProjects = PROJECTS.filter((project) => {
    const matchesSearch =
      project.title[locale].toLowerCase().includes(search.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesTag = activeTag ? project.tags.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <Container size="lg" className="py-12">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Heading level="h1">{t("title")}</Heading>
          <Text size="lead" className="text-base-content/60">
            {t("description")}
          </Text>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:max-w-md">
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="w-4 h-4 opacity-50" />}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? "default" : "outline"}
                className="cursor-pointer transition-all hover:border-primary"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
            {activeTag && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTag(null)}
                className="h-7 px-2"
              >
                <X className="w-3 h-3 mr-1" /> {t("clearFilters")}
              </Button>
            )}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border rounded-xl border-dashed">
            <Text className="text-base-content/50">{t("noResults")}</Text>
          </div>
        )}
      </div>
    </Container>
  );
};
