import { useState, useMemo, useEffect } from "react";
import { Project } from "@/types/data";

export const useProjectFilters = (projects: Project[], locale: "es" | "en") => {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

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
    allTags,
    filteredProjects,
    hasFilters: search !== "" || activeTag !== null,
  };
};
