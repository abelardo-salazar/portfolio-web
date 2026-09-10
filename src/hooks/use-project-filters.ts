import { useState, useMemo } from "react";
import { Project } from "@/types/data";

export const useProjectFilters = (projects: Project[], locale: "es" | "en") => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  // Scaffolding for a future real client-side fetch (server-side search or
  // pagination). Today `projects` arrives already resolved from the Server
  // Component and the filtering below is synchronous, so this stays false.
  // Wire `setIsLoading` to the real async op when that lands.
  const [isLoading, setIsLoading] = useState(false);

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
    isLoading,
    setIsLoading,
    allTags,
    filteredProjects,
    hasFilters: search !== "" || activeTag !== null,
  };
};
