export const scrollToSection = (
  e?: React.MouseEvent | null,
  href: string = "",
  callback?: () => void,
) => {
  const id = href.replace("#", "");
  const element = document.getElementById(id);

  if (element) {
    if (e) e.preventDefault();

    if (callback) callback();

    setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);

    return true;
  }
  return false;
};

export const isLocalSection = (
  pathname: string,
  locale: string,
  type: string,
) => {
  const cleanPath = pathname.replace(/\/$/, "");
  const baseLocalePath = `/${locale}`;

  return (
    type === "section" && (cleanPath === baseLocalePath || pathname === "/")
  );
};
