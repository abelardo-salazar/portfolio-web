"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { FileText } from "lucide-react";
import { downloadCV } from "@/utils/download-cv";
import { ScrollIndicator } from "../navigation/ScrollIndicator";

export const HeroSection = () => {
  const t = useTranslations("Hero");
  const locale = useLocale() as "es" | "en";
  const handleCVDownlodad = () => {
    downloadCV(locale);
  };
  // isolate: without its own stacking context, the -z-10 backdrop sinks
  // behind the page's bg-base-100 wrapper and is never painted.
  // Element opacity instead of color-mix(): same 6% fade, and no build
  // fallback that paints full-strength --primary in older browsers.
  return (
    <section className="relative isolate min-h-[85vh] flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 opacity-[0.06] bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_70%)]" />

      <Container size="lg">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <Badge variant="secondary" size="lg">
              {t("available")}
            </Badge>
          </div>

          <Heading level="h1" className="mx-auto">
            {t("title")}
          </Heading>

          {/* md:px-0 too: otherwise Container's own md:px-8 wins. */}
          <Container size="sm" className="px-0 md:px-0">
            <Text size="lead" className="text-base-content leading-relaxed">
              {t("description")}
            </Text>
          </Container>

          <div className="flex flex-col sm:flex-row  justify-center items-center pt-6">
            <Button
              variant="outline"
              size="lg"
              shape="pill"
              className="px-10"
              onClick={handleCVDownlodad}
            >
              <FileText className="w-4 h-4" />
              {t("cv")}
            </Button>
          </div>
        </div>
      </Container>
      <ScrollIndicator targetId="experience" />
    </section>
  );
};
