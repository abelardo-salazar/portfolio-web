"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Text,
  Button,
} from "@abelardo-salazar/core-ui-design-system";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 w-full z-50 transition-all duration-300 border-b
        ${
          isScrolled
            ? "bg-base-100/80 backdrop-blur-md border-base-content/10 py-2"
            : "bg-transparent border-transparent py-4"
        }
      `}
    >
      <Container size="xl" className="flex items-center justify-between">
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
