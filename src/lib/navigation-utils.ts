export const scrollToSection = (e: React.MouseEvent, href: string) => {
  const id = href.replace("#", "");
  const element = document.getElementById(id);
  if (element) {
    e.preventDefault();
    element.scrollIntoView({ behavior: "smooth" });
    return true;
  }
  return false;
};

export const isLocalSection = (
  pathname: string,
  locale: string,
  type: string,
) => {
  return (
    type === "section" &&
    (pathname === `/${locale}` || pathname === `/${locale}/`)
  );
};
