"use client";

import React, { useState } from "react";
import {
  Container,
  Heading,
  Text,
  Card,
  CardContent,
  Input,
  Textarea,
  Button,
  Toast,
  toast,
} from "@abelardo-salazar/core-ui-design-system";

export const ContactSection = () => {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("¡Mensaje enviado!", {
      description: "Gracias por escribir, Te responderé pronto.",
    });

    setIsPending(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-20 bg-base-100">
      <Toast position="bottom-right" richColors closeButton />

      <Container size="sm">
        <div className="text-center mb-10">
          <Heading level="h2">¿Tienes un proyecto en mente?</Heading>
          <Text size="muted">
            Hablemos sobre cómo puedo ayudarte a construir productos digitales
            excepcionales.
          </Text>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nombre" placeholder="Tu nombre" required />
              <Input
                label="Email"
                type="email"
                placeholder="tu@email.com"
                required
              />
              <Textarea
                label="Mensaje"
                placeholder="¿En qué puedo ayudarte?"
                rows={5}
                required
              />
              <Button type="submit" fullWidth isLoading={isPending}>
                Enviar mensaje
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
};
