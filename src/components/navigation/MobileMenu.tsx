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
import { SystemSettings } from "./SystemSettings";

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
            {t("menu")}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto py-6 space-y-8">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                variant={pathname.includes(link.href) ? "secondary" : "ghost"}
                className="justify-start text-lg h-12"
                asChild
              >
                <Link
                  href={`/${locale}${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href, link.type)}
                >
                  {t(link.labelKey)}
                </Link>
              </Button>
            ))}
          </nav>

          <Separator />

          <SystemSettings />
        </div>
      </SheetContent>
    </Sheet>
  );
};
