import { useTranslations } from "next-intl";
import {
  Badge,
  Button,
  Container,
  Heading,
  Text,
} from "@abelardo-salazar/core-ui-design-system";

export const HeroSection = () => {
  const t = useTranslations("Hero");
  return (
    <section className="py-20 md:py-32">
      <Container size="lg" className="text-center space-y-6">
        <Badge variant="secondary" className="mb-4">
          {t("available")}
        </Badge>

        <Heading
          level="h1"
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          {t("title")}
        </Heading>

        <Container size="sm">
          <Text size="lead" className="text-base-content/70">
            {t("description")}
          </Text>
        </Container>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="px-8">
            {t("projects")}
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            {t("cv")}
          </Button>
        </div>
      </Container>
    </section>
  );
};
