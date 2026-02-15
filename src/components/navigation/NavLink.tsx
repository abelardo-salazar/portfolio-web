"use client";

import { Button } from "@abelardo-salazar/core-ui-design-system";
import Link from "next/link";

interface NavLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
  children: React.ReactNode;
  pathname: string;
  locale: string;
}

export const NavLink = ({ href, children, pathname, locale }: NavLinkProps) => {
  const activePath =
    pathname === `/${locale}${href === "/" ? "" : href}` ||
    (pathname === `/${locale}` && href === "/");

  return (
    <Button
      variant={activePath ? "secondary" : "ghost"}
      size="sm"
      asChild
      className="transition-all duration-200"
    >
      <Link href={`/${locale}${href}`}>{children}</Link>
    </Button>
  );
};
