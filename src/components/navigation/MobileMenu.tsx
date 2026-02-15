"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Separator,
} from "@abelardo-salazar/core-ui-design-system";
import { Menu } from "lucide-react";
import { navLinks } from "@/config/navigation";
import Link from "next/link";

export const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    type: string,
  ) => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

    if (type === "section" && isHomePage) {
      e.preventDefault();
      setOpen(false);

      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold tracking-tighter uppercase">
            Menú
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const fullHref =
              link.type === "section"
                ? `/${locale}${link.href}`
                : `/${locale}${link.href}`;
            const isActive =
              pathname === `/${locale}${link.href === "/" ? "" : link.href}`;

            return (
              <Button
                key={link.href}
                variant={isActive ? "secondary" : "ghost"}
                className="justify-start text-lg h-12"
                asChild
              >
                <Link
                  href={fullHref}
                  onClick={(e) => handleNavClick(e, link.href, link.type)}
                >
                  {t(link.labelKey)}
                </Link>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
