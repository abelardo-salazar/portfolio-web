"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  Container,
  Heading,
  Text,
  Card,
  CardContent,
  Input,
  Textarea,
  Button,
  toast,
} from "@abelardo-salazar/core-ui-design-system";
import { contactSchema, ContactFormData } from "@/schemas/contact";
import { sendContactAction } from "@/actions/send-contact";

export const ContactSection = () => {
  const t = useTranslations("Contact");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    startTransition(async () => {
      const result = await sendContactAction(data);

      if (result.success) {
        toast.success(t("success_title"), {
          description: t("success_message"),
        });
        reset();
      } else {
        toast.error(t("error_generic"));
      }
    });
  };

  return (
    <section id="contacto" className="py-24 scroll-mt-20">
      <Container size="sm">
        <div className="text-center mb-12">
          <Heading level="h2">{t("title")}</Heading>
          <Text size="muted">{t("subtitle")}</Text>
        </div>

        <Card>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label={t("label_name")}
                {...register("name")}
                error={errors.name ? t(`errors.${errors.name.message}`) : ""}
              />
              <Input
                label={t("label_email")}
                {...register("email")}
                error={errors.email ? t(`errors.${errors.email.message}`) : ""}
              />
              <Textarea
                label={t("label_message")}
                {...register("message")}
                error={
                  errors.message ? t(`errors.${errors.message.message}`) : ""
                }
              />
              <Button type="submit" fullWidth isLoading={isPending}>
                {t("submit_button")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
};
