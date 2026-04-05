"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Container,
  Heading,
  Text,
  Card,
  CardContent,
  Button,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";
import { CertificationData } from "@/types/data";
import { ExternalLink, Award } from "lucide-react";

interface CertificationsSectionProps {
  certifications: CertificationData[];
}

export const CertificationsSection = ({
  certifications,
}: CertificationsSectionProps) => {
  const t = useTranslations("Certifications");
  const locale = useLocale() as "es" | "en";

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
            <MotionReveal key={cert._id} delay={index * 0.1}>
              <Card className="h-full bg-base-100/50 hover:border-primary/50 transition-colors flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <Award className="w-6 h-6" />
                    <Text
                      weight="bold"
                      className="text-sm tracking-wider uppercase"
                    >
                      {cert.issuer}
                    </Text>
                  </div>

                  <Heading level="h3" className="text-xl mb-2 flex-grow">
                    {cert.title[locale]}
                  </Heading>

                  <div className="mt-4 pt-4 border-t border-base-content/10 flex items-center justify-between">
                    <Text size="sm" className="text-base-content/60">
                      {new Date(cert.date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                      })}
                    </Text>

                    {cert.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-2 -mr-3"
                      >
                        <Link
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("verify")} <ExternalLink className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </MotionReveal>
          ))}
        </div>
      </Container>
    </section>
  );
};
