"use client";

import {
  Card,
  CardHeader,
  CardContent,
  Text,
  Badge,
  Separator,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../MotionReveal";

interface ExperienceItemProps {
  role: string;
  company: string;
  period: string;
  current: boolean;
  description: string[];
  skills: string[];
  index: number;
  isLast: boolean;
}

export const ExperienceItem = ({
  role,
  company,
  period,
  current,
  description,
  skills,
  index,
  isLast,
}: ExperienceItemProps) => {
  return (
    <MotionReveal delay={index * 0.1}>
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 shrink-0" />
          {!isLast && (
            <Separator
              orientation="vertical"
              className="bg-primary w-[2px] flex-1"
            />
          )}
        </div>

        <div className="pb-12 flex-1">
          <Card className="border-none bg-transparent shadow-none -mt-1.5 p-0">
            <CardHeader className="p-0 mb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <Text weight="bold" size="lg" className="leading-tight">
                    {role}
                  </Text>
                  <Text size="sm" className="text-primary font-medium">
                    {company}
                  </Text>
                </div>
                <Badge variant={current ? "default" : "outline"}>
                  {period}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ul className="space-y-2 mb-4">
                {description.map((achievement, i) => (
                  <li
                    key={i}
                    className="text-sm text-base-content/70 leading-relaxed flex gap-2"
                  >
                    <span className="text-primary">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="text-[10px]"
                  >
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
