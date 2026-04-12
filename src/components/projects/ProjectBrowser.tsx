"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
  Input,
  Badge,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { ProjectCard } from "./ProjectCard";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";
import { Search, X } from "lucide-react";
import { useProjectFilters } from "@/hooks/use-project-filters";
import { Project } from "@/types/data";

export const ProjectBrowser = ({ projects }: { projects: Project[] }) => {
  const t = useTranslations("Projects");
  const locale = useLocale() as "es" | "en";

  const {
    search,
    setSearch,
    activeTag,
    setActiveTag,
    isLoading,
    allTags,
    filteredProjects,
    hasFilters,
  } = useProjectFilters(projects, locale);

  return (
    <Container size="md" className="py-24">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Heading level="h1">{t("title")}</Heading>
          <Text size="lead" className="text-base-content">
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
                className="cursor-pointer"
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTag(null)}
                className="h-7"
              >
                <X className="w-3 h-3 mr-1" /> {t("clearFilters")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                locale={locale}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border rounded-xl border-dashed">
              <Text className="text-base-content">{t("noResults")}</Text>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};
