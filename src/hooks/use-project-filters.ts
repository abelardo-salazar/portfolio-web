import { useState, useMemo, useCallback } from "react";
import { Project } from "@/types/data";

export const useProjectFilters = (projects: Project[], locale: "es" | "en") => {
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    return Array.from(new Set(projects.flatMap((p) => p.tags)));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title[locale].toLowerCase().includes(search.toLowerCase()) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(search.toLowerCase()),
        );
      const matchesTags = activeTags.every((tag) => project.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  }, [projects, search, activeTags, locale]);

  // Ignores the text search on purpose, so options don't toggle while typing.
  const isTagAvailable = useCallback(
    (tag: string) =>
      activeTags.includes(tag) ||
      projects.some((project) =>
        [...activeTags, tag].every((t) => project.tags.includes(t)),
      ),
    [projects, activeTags],
  );

  return {
    search,
    setSearch,
    activeTags,
    setActiveTags,
    allTags,
    isTagAvailable,
    filteredProjects,
    // Keep in sync with clearFilters: every filter counted here must be reset there.
    hasFilters: search !== "" || activeTags.length > 0,
    clearFilters: () => {
      setSearch("");
      setActiveTags([]);
    },
  };
};
