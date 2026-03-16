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
      <Container size="md">
        <MotionReveal>
          <div className="mb-12 text-center md:text-left">
            <Heading level="h2" className="mb-4">
              {t("title")}
            </Heading>
            <Text size="lead">{t("subtitle")}</Text>
          </div>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MotionReveal delay={0.1}>
            <Card className="h-full bg-transparent border-primary">
              <CardContent className="pt-6">
                <Heading level="h3" className="text-xl mb-6">
                  {t("technical")}
                </Heading>
                <div className="flex flex-col gap-3">
                  {skills.technical?.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-base-content border border-base-content hover:border-primary transition-colors"
                    >
                      <Text weight="bold" className="text-sm md:text-base">
                        {skill.name}
                      </Text>
                      <Badge variant="secondary">
                        {t(`levels.${skill.level}`)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.2}>
            <Card className="h-full bg-transparent border-primary">
              <CardContent className="pt-6">
                <Heading level="h3" className="text-xl mb-6">
                  {t("soft")}
                </Heading>
                <ul className="space-y-3">
                  {skills.soft?.map((skill, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-base-content"
                    >
                      <span className="text-secondary mt-1">✓</span>
                      {skill[locale]}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </MotionReveal>

          <MotionReveal delay={0.3}>
            <Card className="h-full bg-transparent border-primary">
              <CardContent className="pt-6">
                <Heading level="h3" className="text-xl mb-6">
                  {t("languages")}
                </Heading>
                <div className="space-y-4">
                  {skills.languages?.map((lang, index) => (
                    <div key={index} className="flex flex-col">
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
