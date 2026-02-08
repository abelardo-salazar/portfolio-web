"use client";

import {
  Container,
  Text,
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Separator,
} from "@abelardo-salazar/core-ui-design-system";
import { Github, Linkedin, Settings } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const Footer = () => {
  return (
    <footer className="py-12 border-t bg-base-100">
      <Container
        size="lg"
        className="flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div>
          <Text weight="bold">Abelardo Salazar</Text>
          <Text size="sm" className="text-base-content/60">
            © 2026 • Frontend Engineer
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Preferencias
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Configuración</SheetTitle>
                <SheetDescription>
                  Personaliza tu experiencia visual en mi portafolio.
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Text size="sm" weight="medium">
                    Idioma / Language
                  </Text>
                  <div className="flex gap-2">
                    <LanguageSwitcher />
                  </div>
                </div>
                <div className="space-y-4">
                  <Text size="sm" weight="medium">
                    Apariencia
                  </Text>
                  <ThemeSwitcher />
                </div>
                <Separator />

                <div className="space-y-2">
                  <Text size="sm" weight="medium">
                    Redes Profesionales
                  </Text>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="ghost" className="justify-start gap-3">
                      <Github className="w-4 h-4" /> GitHub
                    </Button>
                    <Button variant="ghost" className="justify-start gap-3">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </footer>
  );
};
