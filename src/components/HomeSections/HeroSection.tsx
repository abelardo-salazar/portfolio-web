"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from "@/components/ui/ui-wrapper";
import { FileText } from "lucide-react";
import { MotionReveal } from "../ui/MotionReveal"; // Importando tu componente
import { downloadCV } from "@/utils/download-cv";
import { ScrollIndicator } from "../navigation/ScrollIndicator";

export const HeroSection = () => {
  const t = useTranslations("Hero");
  const locale = useLocale() as "es" | "en";
  const handleCVDownlodad = () => {
    downloadCV(locale);
  };
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.04),transparent_70%)]" />

      <Container size="lg">
        <MotionReveal delay={0.2}>
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <Badge variant="secondary" className="px-4 py-1.5 gap-2 ">
                {t("available")}
              </Badge>
            </div>

            <Heading level="h1" className="mx-auto">
              {t("title")}
            </Heading>

            <Container size="sm" className="px-0">
              <Text
                size="lead"
                className="text-base-content/60 leading-relaxed"
              >
                {t("description")}
              </Text>
            </Container>

            <div className="flex flex-col sm:flex-row  justify-center items-center pt-6">
              <Button
                variant="outline"
                size="lg"
                className="px-10 rounded-full gap-2"
                onClick={handleCVDownlodad}
              >
                <FileText className="w-4 h-4" />
                {t("cv")}
              </Button>
            </div>
          </div>
        </MotionReveal>
      </Container>
      <ScrollIndicator targetId="experience" />
    </section>
  );
};
