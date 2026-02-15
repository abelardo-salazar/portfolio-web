"use client";

import { useTranslations } from "next-intl";
import {
  Text,
  Separator,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { Github, Linkedin } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { siteConfig } from "@/config/site";

export const SystemSettings = () => {
  const t = useTranslations("Footer");

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-3">
        <Text size="sm" weight="medium">
          {t("language")}
        </Text>
        <LanguageSwitcher />
      </div>

      <Separator />

      <div className="space-y-3">
        <Text size="sm" weight="medium">
          {t("appearance")}
        </Text>
        <ThemeSwitcher />
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 md:flex md:justify-around">
          <Button variant="ghost" className="justify-start gap-3" asChild>
            <a href={siteConfig.links.github} target="_blank">
              <Github className="w-4 h-4" /> Github
            </a>
          </Button>
          <Button variant="ghost" className="justify-start gap-3" asChild>
            <a href={siteConfig.links.linkedin} target="_blank">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};
