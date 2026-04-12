"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";
import { ProfileData } from "@/types/data";

interface AboutSectionProps {
  profile: ProfileData | null;
}

export const AboutSection = ({ profile }: AboutSectionProps) => {
  const t = useTranslations("About");
  const locale = useLocale() as "es" | "en";

  if (!profile || !profile.bio) return null;

  const paragraphs = profile.bio[locale] || [];

  return (
    <section id="about" className="py-10 md:py-32 scroll-mt-20">
      <Container size="md">
        <div
          className={`grid gap-12 items-center ${profile.image ? "lg:grid-cols-2" : ""}`}
        >
          <MotionReveal>
            <div className="space-y-6">
              <Heading level="h2" className="mb-6">
                {t("title")}
              </Heading>

              <div className="space-y-4 text-base-content">
                {paragraphs.map((paragraph, index) => (
                  <Text key={index} className="leading-relaxed text-lg">
                    {paragraph}
                  </Text>
                ))}
              </div>
            </div>
          </MotionReveal>

          {profile.image && (
            <MotionReveal delay={0.2}>
              <div className="relative aspect-square max-w-md mx-auto lg:ml-auto w-full overflow-hidden rounded-2xl border border-primary/20 shadow-xl">
                <Image
                  src={profile.image}
                  alt="Abelardo Salazar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </MotionReveal>
          )}
        </div>
      </Container>
    </section>
  );
};
