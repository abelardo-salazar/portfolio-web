"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Container,
  Text,
  Button,
  Separator,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@abelardo-salazar/core-ui-design-system";
import { Github, Linkedin, Settings, ExternalLink } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { navLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export const Footer = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="py-12 border-t bg-base-100/50">
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="space-y-4">
            <div>
              <Text weight="bold" size="lg">
                {siteConfig.name}
              </Text>
              <Text size="sm" className="text-base-content/60">
                Senior Frontend Engineer
              </Text>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={siteConfig.links.linkedin}
                  target="_blank"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Text
              weight="bold"
              size="sm"
              className="uppercase tracking-wider opacity-50"
            >
              {t("Navbar.home")}
            </Text>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="text-sm hover:text-primary transition-colors py-1"
                >
                  {t(`Navbar.${link.labelKey}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-4">
            <Text
              weight="bold"
              size="sm"
              className="uppercase tracking-wider opacity-50"
            >
              {t("Footer.settingsTitle")}
            </Text>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between w-full md:w-auto"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {t("Footer.preferences")}
                  </div>
                  <ExternalLink className="w-3 h-3 opacity-30" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>{t("Footer.settingsTitle")}</SheetTitle>
                  <SheetDescription>
                    {t("Footer.settingsDescription")}
                  </SheetDescription>
                </SheetHeader>

                <div className="py-8 space-y-8">
                  <div className="space-y-4">
                    <Text size="sm" weight="medium">
                      {t("Footer.language")}
                    </Text>
                    <LanguageSwitcher />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <Text size="sm" weight="medium">
                      {t("Footer.appearance")}
                    </Text>
                    <ThemeSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Separator className="my-8 opacity-50" />

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-base-content/40">
          <Text>© 2026 {siteConfig.name}</Text>
        </div>
      </Container>
    </footer>
  );
};
