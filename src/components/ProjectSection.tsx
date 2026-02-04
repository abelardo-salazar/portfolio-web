"use client";

import {
  Container,
  Heading,
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "./MotionReveal";

const PROJECTS = [
  {
    title: "Core UI Design System",
    description:
      "Biblioteca de componentes privada construida con React 19 y Tailwind v4.",
    tags: ["React 19", "TypeScript", "Tailwind CSS"],
    link: "#",
  },
  {
    title: "Portfolio 2026",
    description:
      "Mi portafolio personal utilizando arquitectura de App Router y Server Components.",
    tags: ["Next.js 15", "Turbo", "Radix UI"],
    link: "#",
  },
];

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
            <MotionReveal key={index} delay={index * 0.1}>
              <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" fullWidth>
                    Ver detalles
                  </Button>
                </CardFooter>
              </Card>
            </MotionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
