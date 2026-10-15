"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Container } from "@abelardo-salazar/core-ui-design-system";
import { navLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { NavLink } from "../navigation/NavLink";
import { MobileMenu } from "../navigation/MobileMenu";
import { useScroll } from "@/hooks/use-scroll";
import { scrollToSection, isLocalSection } from "@/utils/scroll-to-section";
import Image from "next/image";
import { useThemeManager } from "@/hooks/use-theme-manager";

export const Navbar = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Navbar");
  const isScrolled = useScroll(20);
  const { isDark, isMounted } = useThemeManager();

  const onNavClick = (
    e: React.MouseEvent<HTMLElement>,
    href: string,
    type: string,
  ) => {
    if (isLocalSection(pathname, locale, type)) {
      scrollToSection(e, href);
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
          {!isMounted ? (
            <div className="h-10 w-[192px]" /> // Placeholder invisible para evitar Layout Shift
          ) : isDark ? (
            <Image
              src="/logo-dark.png"
              alt={siteConfig.name}
              width={384}
              height={75}
              className="h-10 w-auto"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <Image
              src="/logo-light.png"
              alt={siteConfig.name}
              width={384}
              height={75}
              className="h-10 w-auto"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              pathname={pathname}
              locale={locale}
              onClick={(e) => onNavClick(e, link.href, link.type)}
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
