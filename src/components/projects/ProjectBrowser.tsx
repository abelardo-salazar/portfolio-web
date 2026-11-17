"use client";

import { useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
  Input,
  Combobox,
  type ComboboxOption,
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
    activeTags,
    setActiveTags,
    allTags,
    availableTags,
    filteredProjects,
    hasFilters,
    clearFilters,
  } = useProjectFilters(projects, locale);

  const tagOptions: ComboboxOption[] = allTags.map((tag) => {
    const available = availableTags.has(tag);
    return {
      value: tag,
      label: tag,
      disabled: !available,
      description: available ? undefined : t("tagUnavailable"),
    };
  });

  const resultCount = filteredProjects.length;
  // Sorted copy: selection order doesn't change the filter, so it must not
  // change the key. The state itself keeps its order for the chips.
  const filterKey = JSON.stringify([search, [...activeTags].sort()]);
  // Compare against the last announced filters instead of a "first render"
  // flag: StrictMode's dev double-mount keeps refs, so a flag would announce
  // on mount. It also skips filters that end up where they started.
  const lastAnnounced = useRef(filterKey);

  useEffect(() => {
    if (filterKey === lastAnnounced.current) return;
    const timer = setTimeout(() => {
      lastAnnounced.current = filterKey;
      announce(t("resultsCount", { count: resultCount }));
    }, ANNOUNCE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filterKey, resultCount, t]);

  return (
    <Container size="md" className="py-24">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <Heading level="h1">{t("title")}</Heading>
          <Text size="lead" className="text-base-content">
            {t("description")}
          </Text>
        </div>

        {/* items-start: the combobox grows as tags wrap; the rest stays on top.
            Below lg the clear button wraps to its own line, so showing it
            doesn't shrink the fields while they're in use. */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
          <div className="w-full md:flex-1 md:max-w-sm">
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

          <Combobox
            aria-label={t("tagsLabel")}
            multiple
            mode="popover"
            size="md"
            className="w-full md:flex-1 md:max-w-sm"
            options={tagOptions}
            value={activeTags}
            onValueChange={setActiveTags}
            placeholder={t("tagsPlaceholder")}
            searchPlaceholder={t("tagsSearchPlaceholder")}
            emptyLabel={t("tagsEmpty")}
            removeLabel={(tag) => t("removeTag", { tag })}
          />

          {hasFilters && (
            <div className="flex flex-col md:flex-row md:basis-full lg:basis-auto">
              <Button variant="ghost" size="md" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" /> {t("clearFilters")}
              </Button>
            </div>
          )}
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
