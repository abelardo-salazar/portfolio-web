"use client";

import {
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../MotionReveal";
import { ProjectCard } from "../projects/ProjectCard";
import { PROJECTS } from "@/data/projects";

export const ProjectSection = () => {
  return (
    <section id="proyectos" className="py-20 bg-base-200/50">
      <Container size="lg">
        <MotionReveal>
          <div className="mb-12">
            <Heading level="h2">Proyectos Destacados</Heading>
            <Text size="muted">
              Selección de trabajos recientes y herramientas open-source.
            </Text>
          </div>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
};
