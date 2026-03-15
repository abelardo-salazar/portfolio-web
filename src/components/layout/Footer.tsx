"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
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
} from "@abelardo-salazar/core-ui-design-system";
import { siteConfig } from "@/config/site";
import { SystemSettings } from "../preferences/SystemSettings";
import { Settings, Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 md:py-12 border-t bg-base-100/50 backdrop-blur-sm">
      <Container
        size="lg"
        className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8"
      >
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Text weight="bold" className="text-lg">
            {siteConfig.name}
          </Text>
          <Text size="sm" className="text-base-content/60">
            © {currentYear} • Senior Frontend Engineer
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:text-primary"
          >
            <Link
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:text-primary"
          >
            <Link
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full hover:text-primary"
          >
            <Link href={`mailto:tu-email@ejemplo.com`} aria-label="Email">
              <Mail className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center w-full md:w-auto justify-center md:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full md:w-auto rounded-full"
              >
                <Settings className="w-4 h-4" />
                {t("Footer.preferences")}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-6">
                <SheetTitle>{t("Footer.settingsTitle")}</SheetTitle>
                <SheetDescription>
                  {t("Footer.settingsDescription")}
                </SheetDescription>
              </SheetHeader>
              <SystemSettings />
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </footer>
  );
};
