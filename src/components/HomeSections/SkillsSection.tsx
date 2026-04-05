"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
  Badge,
  Card,
  CardContent,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";
import { SkillData } from "@/types/data";

interface SkillsSectionProps {
  skills: SkillData | null;
}

export const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const t = useTranslations("Skills");
  const locale = useLocale() as "es" | "en";

  if (!skills) return null;

  return (
    <section id="skills" className="py-10 md:py-32 scroll-mt-20 bg-base-100">
      <Container size="lg">
        <MotionReveal>
          <div className="mb-12 text-center md:text-left">
            <Heading level="h2" className="mb-4">
              {t("title")}
            </Heading>
            <Text size="lead">{t("subtitle")}</Text>
          </div>
        </MotionReveal>

        <div className="flex flex-col gap-6">
          <MotionReveal delay={0.1}>
            <Card className="bg-transparent border-primary/20">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="w-full md:w-1/3 shrink-0">
                  <Heading level="h3" className="text-xl text-primary">
                    {t("technical")}
                  </Heading>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.technical?.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-base-content/5 border border-base-content/10 hover:border-primary/30 transition-colors"
                    >
                      <Text weight="bold" className="text-sm">
                        {skill.name}
                      </Text>
                      <Badge variant="secondary" className="text-xs">
                        {t(`levels.${skill.level}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.2}>
            <Card className="bg-transparent border-primary/20">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="w-full md:w-1/3 shrink-0">
                  <Heading level="h3" className="text-xl text-primary">
                    {t("soft")}
                  </Heading>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {skills.soft?.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-base-content"
                    >
                      <span className="text-secondary shrink-0 mt-0.5">✓</span>
                      <Text className="text-sm md:text-base leading-snug">
                        {skill[locale]}
                      </Text>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.3}>
            <Card className="bg-transparent border-primary/20">
              <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12">
                <div className="w-full md:w-1/3 shrink-0">
                  <Heading level="h3" className="text-xl text-primary">
                    {t("languages")}
                  </Heading>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {skills.languages?.map((lang, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <Text weight="bold" className="text-lg">
                        {lang.name[locale]}
                      </Text>
                      <Text size="sm" className="text-secondary font-medium">
                        {t(`language_levels.${lang.level}`)}
                      </Text>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionReveal>
        </div>
      </Container>
    </section>
  );
};
