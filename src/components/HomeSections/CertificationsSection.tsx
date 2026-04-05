"use client";

import { useTranslations } from "next-intl";
import {
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";
import { CertificationData } from "@/types/data";
import { CertificationCard } from "../certifications/CertificatiionCard";

interface CertificationsSectionProps {
  certifications: CertificationData[];
}

export const CertificationsSection = ({
  certifications,
}: CertificationsSectionProps) => {
  const t = useTranslations("Certifications");

  if (!certifications || certifications.length === 0) return null;

  return (
    <section id="certifications" className="py-10 md:py-32 scroll-mt-20">
      <Container size="md">
        <MotionReveal>
          <div className="mb-12 text-center md:text-left">
            <Heading level="h2" className="mb-4">
              {t("title")}
            </Heading>
            <Text size="lead">{t("subtitle")}</Text>
          </div>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, index) => (
            <CertificationCard
              key={cert._id}
              certification={cert}
              index={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};
