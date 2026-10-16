"use client";

import { useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
  Input,
  Chip,
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateActions,
  announce,
} from "@abelardo-salazar/core-ui-design-system";
import { ProjectCard } from "./ProjectCard";
import { Search, SearchX, X } from "lucide-react";
import { useProjectFilters } from "@/hooks/use-project-filters";
import { Project } from "@/types/data";

const ANNOUNCE_DEBOUNCE_MS = 500;

export const ProjectBrowser = ({ projects }: { projects: Project[] }) => {
  const t = useTranslations("Projects");
  const locale = useLocale() as "es" | "en";

  const {
    search,
    setSearch,
    activeTag,
    setActiveTag,
    allTags,
    filteredProjects,
    hasFilters,
    clearFilters,
  } = useProjectFilters(projects, locale);

  const resultCount = filteredProjects.length;
  // Compare against the last announced filters instead of a "first render"
  // flag: StrictMode's dev double-mount keeps refs, so a flag would announce
  // on mount. It also skips filters that end up where they started.
  const lastAnnounced = useRef(JSON.stringify([search, activeTag]));

  useEffect(() => {
    const key = JSON.stringify([search, activeTag]);
    if (key === lastAnnounced.current) return;
    const timer = setTimeout(() => {
      lastAnnounced.current = key;
      announce(t("resultsCount", { count: resultCount }));
    }, ANNOUNCE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, activeTag, resultCount, t]);

  return (
    <Container size="md" className="py-24">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Heading level="h1">{t("title")}</Heading>
          <Text size="lead" className="text-base-content">
            {t("description")}
          </Text>
        </div>

        <div className="flex flex-col gap-4">
          <div className="w-full md:max-w-md">
            <Input
              aria-label={t("searchLabel")}
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="w-4 h-4 opacity-50" />}
              clearable
              clearLabel={t("clearSearch")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Chip
                key={tag}
                variant="outline"
                size="lg"
                pressed={activeTag === tag}
                onPressedChange={(pressed) => setActiveTag(pressed ? tag : null)}
              >
                {tag}
              </Chip>
            ))}
            {hasFilters && (
              <Button variant="ghost" size="md" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" /> {t("clearFilters")}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                locale={locale}
              />
            ))
          ) : (
            <EmptyState size="md" className="col-span-full">
              <EmptyStateIcon>
                <SearchX />
              </EmptyStateIcon>
              <EmptyStateTitle as="h2">{t("noResults")}</EmptyStateTitle>
              <EmptyStateActions>
                <Button variant="outline" size="md" onClick={clearFilters}>
                  {t("resetFilters")}
                </Button>
              </EmptyStateActions>
            </EmptyState>
          )}
        </div>
      </div>
    </Container>
  );
};
