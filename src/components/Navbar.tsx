"use client";
import {
  Container,
  Text,
  Button,
} from "@abelardo-salazar/core-ui-design-system";

export const Navbar = () => {
  return (
    <nav className="border-b bg-base-100/80 backdrop-blur-md sticky top-0 z-50">
      <Container size="xl" className="h-16 flex items-center justify-between">
        <Text weight="bold" size="lg" as="span" className="tracking-tighter">
          ABELARDO.DEV
        </Text>

        <div className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm">
            Proyectos
          </Button>
          <Button variant="ghost" size="sm">
            Experiencia
          </Button>
          <Button variant="primary" size="sm">
            Contacto
          </Button>
        </div>
      </Container>
    </nav>
  );
};
