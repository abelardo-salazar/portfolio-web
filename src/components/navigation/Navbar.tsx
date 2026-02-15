"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Container, Text } from "@abelardo-salazar/core-ui-design-system";
import { navLinks } from "@/config/navigation";
import { NavLink } from "./NavLink";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { MobileMenu } from "./MobileMenu";
import Link from "next/link";

export const Navbar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLElement>,
    href: string,
    type: string,
  ) => {
    const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`;

    if (type === "section" && isHomePage) {
      e.preventDefault();
      const id = href.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-base-100/80 backdrop-blur-md border-base-content/10 py-3"
          : "bg-transparent border-transparent py-5"
      }`}
    >
      <Container size="xl" className="flex items-center justify-between">
        <Link
          href={`/${locale}`}
          className="hover:opacity-80 transition-opacity"
        >
          <Text weight="bold" size="lg" className="tracking-tighter uppercase">
            {siteConfig.name}
          </Text>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              pathname={pathname}
              locale={locale}
              onClick={(e) => handleNavClick(e, link.href, link.type)}
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </div>
        <MobileMenu />
      </Container>
    </nav>
  );
};
