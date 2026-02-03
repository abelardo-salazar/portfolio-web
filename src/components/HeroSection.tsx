import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";

export const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <Container size="lg" className="text-center space-y-6">
        <Badge variant="secondary" className="mb-4">
          Disponible para nuevos proyectos
        </Badge>

        <Heading
          level="h1"
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Building scalable products with{" "}
          <span className="text-primary">refined code</span>.
        </Heading>

        <Container size="sm">
          <Text size="lead" className="text-base-content/70">
            Senior Frontend Engineer especializado en ecosistemas de React.
            Actualmente desarrollando sistemas de diseño privados y
            arquitecturas de alto rendimiento.
          </Text>
        </Container>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="px-8">
            Ver Proyectos
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Descargar CV
          </Button>
        </div>
      </Container>
    </section>
  );
};
