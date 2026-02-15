"use client";

import { useTranslations, useLocale } from "next-intl";
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
import { SystemSettings } from "./SystemSettings";
import { Settings } from "lucide-react";

export const Footer = () => {
  const t = useTranslations();

  return (
    <footer className="py-12 border-t bg-base-100">
      <Container
        size="lg"
        className="flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div>
          <Text weight="bold" className="text-center md:text-left">
            {siteConfig.name}
          </Text>
          <Text size="sm" className="text-base-content/60">
            © 2026 • Frontend Engineer
          </Text>
        </div>

        <div className="hidden md:flex md:items-center md:gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                {t("Footer.preferences")}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
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
