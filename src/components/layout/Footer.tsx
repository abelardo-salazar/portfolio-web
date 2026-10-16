"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import {
  Container,
  Text,
  Button,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetDescription,
} from "@abelardo-salazar/core-ui-design-system";
import { siteConfig } from "@/config/site";
import { SystemSettings } from "../preferences/SystemSettings";
import { Settings, Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();
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
          <Text size="sm" className="text-base-content">
            © {currentYear} • {t("Footer.role")}
          </Text>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            shape="pill"
            className="hover:text-primary"
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
            shape="pill"
            className="hover:text-primary"
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
            shape="pill"
            className="hover:text-primary"
          >
            <Link
              href={`/${locale}#contact`}
              aria-label={t("Footer.contactForm")}
            >
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
                shape="pill"
                className="w-full md:w-auto"
              >
                <Settings className="w-4 h-4" />
                {t("Footer.preferences")}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              closeLabel={t("Footer.closeSettings")}
            >
              <SheetHeader>
                <SheetTitle>{t("Footer.settingsTitle")}</SheetTitle>
                <SheetDescription>
                  {t("Footer.settingsDescription")}
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <SystemSettings />
              </SheetBody>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </footer>
  );
};
