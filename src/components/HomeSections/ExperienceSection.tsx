"use client";
import { useTranslations } from "next-intl";
import {
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { EXPERIENCES } from "@/data/experiences";
import { ExperienceItem } from "./ExperienceItem";

export const ExperienceSection = () => {
  const t = useTranslations("Experience");

  return (
    <section id="experience" className="py-24">
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
              exp={exp}
              index={index}
              isLast={index === EXPERIENCES.length - 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
