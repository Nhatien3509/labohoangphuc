"use client";

import { NavMenuList } from "@common/components/layout/navigation-menu/NavMenuList";
import NavMenuTrigger from "@common/components/layout/navigation-menu/NavMenuTrigger";

import { ROUTES } from "@common/lib/core/routes";
import { cn } from "@common/lib/core/utils";
import { useEffect } from "react";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";
import { usePathname } from "next/navigation";
import { useToggle } from "@common/hooks/useToggle";

const NavMenu = () => {
  const { value: isMenuOpen, toggle: toggleMenu } = useToggle();
  const pathName = usePathname();
  const isMarketplace = pathName.includes(ROUTES.marketplace.home);
  const t = useLayoutStore((state) => state.t);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isMenuOpen);
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    toggleMenu(false);
  }, [pathName]);

  if (isMarketplace) return null;

  return (
    <>
      <button
        onClick={() => {
          toggleMenu();
        }}
        className={cn(
          "absolute bottom-0 left-0 right-0 top-[4.125rem] z-[12] flex h-[100vh] w-full bg-neutral-900 opacity-40 transition-all duration-300 ease-in-out max-lg:top-[3.75rem]",
          isMenuOpen ? "animate-in fade-in-0" : "hidden animate-out fade-out-0",
        )}
      />
      <NavMenuTrigger isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      <div
        className={cn(
          "absolute bottom-0 left-0 top-[4.125rem] z-[12] h-0 w-72 flex-shrink-0 bg-neutral-0 transition-all duration-300 ease-in-out dark:bg-neutral-dark-0 max-lg:top-[3.75rem]",
          isMenuOpen
            ? "h-[100vh] translate-x-0 opacity-100"
            : "-translate-x-full opacity-0",
        )}
      >
        <NavMenuList toggleMenu={toggleMenu} t={t} />
      </div>
    </>
  );
};

export default NavMenu;
