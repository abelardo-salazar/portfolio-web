import {
  Text,
  Badge,
  TimelineItem,
} from "@abelardo-salazar/core-ui-design-system";
import { MotionReveal } from "../ui/MotionReveal";

interface ExperienceItemProps {
  role: string;
  company: string;
  period: string;
  current: boolean;
  description: string[];
  skills: string[];
  index: number;
}

export const ExperienceItem = ({
  role,
  company,
  period,
  current,
  description,
  skills,
  index,
}: ExperienceItemProps) => {
  return (
    <TimelineItem>
      {/* Inside the item: MotionReveal renders a div, which can't be a child of the <ol>. */}
      <MotionReveal delay={index * 0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div>
            <Text weight="bold" size="lg" className="leading-tight">
              {role}
            </Text>
            <Text size="sm" className="text-primary font-medium">
              {company}
            </Text>
          </div>
          <Badge variant={current ? "default" : "outline"}>{period}</Badge>
        </div>

        <ul className="space-y-2 mb-4 list-disc pl-5 marker:text-primary">
          {description.map((achievement, i) => (
            <li key={i} className="text-sm text-base-content leading-relaxed">
              {achievement}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      </MotionReveal>
    </TimelineItem>
  );
};
