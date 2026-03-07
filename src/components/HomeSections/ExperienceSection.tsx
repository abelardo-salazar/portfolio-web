"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { EXPERIENCES } from "@/data/experiences";
import { ExperienceItem } from "../experience/ExperienceItem";

export const ExperienceSection = () => {
  const t = useTranslations("Experience");
  const locale = useLocale() as "es" | "en";

  return (
    <section id="experience" className="py-10 md:py-32 scroll-mt-20">
      <Container size="md">
        <div className="mb-16 text-center md:text-left">
          <Heading level="h2" className="mb-4">
            {t("title")}
          </Heading>
          <Text size="lead" className="text-base-content/60">
            {t("subtitle")}
          </Text>
        </div>

        <div className="max-w-3xl mx-auto md:mx-0">
          {EXPERIENCES.map((exp, index) => (
            <ExperienceItem
              key={exp.id}
              index={index}
              isLast={index === EXPERIENCES.length - 1}
              role={exp.role[locale]}
              company={exp.company}
              period={exp.period}
              current={exp.current}
              description={exp.description[locale]}
              skills={exp.skills}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
