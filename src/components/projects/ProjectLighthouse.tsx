import { getFormatter, getTranslations } from "next-intl/server";
import { Heading, ProgressRing } from "@abelardo-salazar/core-ui-design-system";
import type { ProjectLighthouseData } from "@/types/data";

const CATEGORIES = ["performance", "accessibility", "bestPractices", "seo"] as const;

// Lighthouse's own score bands.
const variantFor = (score: number) =>
  score >= 90 ? "success" : score >= 50 ? "warning" : "error";

interface ProjectLighthouseProps {
  lighthouse: ProjectLighthouseData;
  locale: string;
}

export async function ProjectLighthouse({ lighthouse, locale }: ProjectLighthouseProps) {
  const t = await getTranslations({ locale, namespace: "Projects.lighthouse" });
  const format = await getFormatter({ locale });
  // UTC midnight formatted in UTC: the stored day, whatever the server's zone.
  const date = format.dateTime(new Date(`${lighthouse.measuredAt}T00:00:00Z`), {
    dateStyle: "long",
    timeZone: "UTC",
  });

  return (
    <section className="p-6 rounded-2xl bg-base-content/5 border border-base-content/10">
      <Heading
        level="h4"
        className="text-sm uppercase tracking-widest text-primary font-bold mb-4"
      >
        {t("title")}
      </Heading>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
        {CATEGORIES.map((category) => {
          const score = lighthouse.scores[category];
          const label = t(`categories.${category}`);
          return (
            <li key={category} className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                {/* The ring carries name and value (aria-label, aria-valuenow);
                    the visible number and caption would only repeat them. */}
                <ProgressRing
                  value={score}
                  variant={variantFor(score)}
                  size={72}
                  aria-label={label}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center text-lg font-bold text-base-content"
                >
                  {score}
                </span>
              </div>
              <span aria-hidden="true" className="text-xs font-medium text-base-content">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs text-base-content">
        {t("measuredAt", { date })} · {t(`formFactor.${lighthouse.formFactor}`)}
      </p>
    </section>
  );
}
