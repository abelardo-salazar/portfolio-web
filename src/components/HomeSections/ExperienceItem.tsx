"use client";
import { Experience } from "@/types/data";
import { useLocale } from "next-intl";
import {
  Card,
  CardHeader,
  CardContent,
  Text,
  Badge,
  Separator,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../MotionReveal";

export const ExperienceItem = ({
  exp,
  index,
  isLast,
}: {
  exp: Experience;
  index: number;
  isLast: boolean;
}) => {
  const locale = useLocale() as "es" | "en";

  return (
    <MotionReveal delay={index * 0.1}>
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 shrink-0" />

          {!isLast && (
            <Separator orientation="vertical" className="bg-primary" />
          )}
        </div>

        <div className="pb-12 flex-1">
          <Card className="border-none bg-transparent shadow-none -mt-1.5 p-0">
            <CardHeader className="p-0 mb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <Text weight="bold" size="lg" className="leading-tight">
                    {exp.role[locale]}
                  </Text>
                  <Text size="sm" className="text-primary font-medium">
                    {exp.company}
                  </Text>
                </div>
                <Badge variant={exp.current ? "default" : "outline"}>
                  {exp.period}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ul className="space-y-2 mb-4">
                {exp.description[locale].map((achievement, i) => (
                  <li
                    key={i}
                    className="text-sm text-base-content/70 leading-relaxed"
                  >
                    • {achievement}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MotionReveal>
  );
};
