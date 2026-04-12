import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Heading,
  Text,
  Card,
  CardContent,
  Button,
  Badge,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";
import { CertificationData } from "@/types/data";
import { ExternalLink, Award } from "lucide-react";

interface CertificationCardProps {
  certification: CertificationData;
  index: number;
}
export const CertificationCard = ({
  certification,
  index,
}: CertificationCardProps) => {
  const t = useTranslations("Certifications");
  const locale = useLocale() as "es" | "en";
  return (
    <MotionReveal key={certification._id} delay={index * 0.1}>
      <Card className="h-full bg-base-100/50 hover:border-primary/50 transition-colors flex flex-col">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <Award className="w-6 h-6 shrink-0" />
            <Text weight="bold" className="text-sm tracking-wider uppercase">
              {certification.issuer}
            </Text>
          </div>

          <Heading level="h3" className="text-xl mb-3">
            {certification.title[locale]}
          </Heading>

          {certification.description && (
            <Text size="sm" className="text-base-content/80 mb-6 flex-grow">
              {certification.description[locale]}
            </Text>
          )}

          {certification.skills && certification.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {certification.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-base-content/10 flex items-center justify-between">
            <Text size="sm" className="text-base-content/60">
              {new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "long",
                timeZone: "UTC",
              }).format(new Date(`${certification.date}T12:00:00Z`))}
            </Text>

            {certification.url && (
              <Button variant="ghost" size="sm" asChild className="gap-2 -mr-3">
                <Link
                  href={certification.url}
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
  );
};
