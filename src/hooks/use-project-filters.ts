import { useState, useMemo } from "react";
import { Project } from "@/types/data";

export const useProjectFilters = (projects: Project[], locale: "es" | "en") => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
      const matchesTag = activeTag ? project.tags.includes(activeTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [projects, search, activeTag, locale]);

  return {
    search,
    setSearch,
    activeTag,
    setActiveTag,
    allTags,
    filteredProjects,
    // Keep in sync with clearFilters: every filter counted here must be reset there.
    hasFilters: search !== "" || activeTag !== null,
    clearFilters: () => {
      setSearch("");
      setActiveTag(null);
    },
  };
};
