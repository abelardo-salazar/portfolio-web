"use client";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Heading, Text } from "@/components/ui/ui-wrapper";

interface SectionProps {
  title: string;
  items: string[];
}

export const ProjectFeatures = ({ title, items }: SectionProps) => (
  <section className="space-y-6">
    <Heading level="h3" className="text-2xl font-bold">
      {title}
    </Heading>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((feature, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 rounded-xl bg-base-content/5 border border-base-content/5"
        >
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <Text size="sm" weight="medium">
            {feature}
          </Text>
        </div>
      ))}
    </div>
  </section>
);

export const ProjectChallenges = ({ title, items }: SectionProps) => (
  <section className="space-y-6 p-8 rounded-2xl bg-primary/5 border border-primary/10">
    <div className="flex items-center gap-3 mb-2">
      <AlertCircle className="w-6 h-6 text-primary" />
      <Heading level="h3" className="text-2xl font-bold">
        {title}
      </Heading>
    </div>
    <ul className="space-y-4">
      {items.map((challenge, i) => (
        <li key={i} className="flex gap-4">
          <span className="font-mono text-primary font-bold">0{i + 1}.</span>
          <Text className="text-base-content italic">{challenge}</Text>
        </li>
      ))}
    </ul>
  </section>
);
