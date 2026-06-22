import { Button } from "@common/components/ui/button";
import IconWithTooltip from "@common/components/containers/IconWithTooltip";

import { Hamburger, X } from "@common/components/icons";
import { useLayoutStore } from "@common/components/layout/providers/LayoutStoreProvider";

type NavMenuTriggerProps = {
  isMenuOpen: boolean;
  toggleMenu: () => void;
};

const NavMenuTrigger = ({ isMenuOpen, toggleMenu }: NavMenuTriggerProps) => {
  const { t } = useLayoutStore((state) => state);
  return (
    <Button
      className={"h-auto p-0"}
      onClick={() => {
        toggleMenu();
      }}
      variant="text"
    >
      {isMenuOpen ? (
        <IconWithTooltip
          tooltipProps={{
            content: t("common.actions.close"),
          }}
        >
          <X className="origin-center transform cursor-pointer text-neutral-900 base-transition hover:text-neutral-500" />
        </IconWithTooltip>
      ) : (
        <IconWithTooltip
          tooltipProps={{
            content: "Menu",
          }}
        >
          <Hamburger className="origin-center transform cursor-pointer text-neutral-500 base-transition hover:text-neutral-900 dark:text-neutral-dark-700" />
        </IconWithTooltip>
      )}
    </Button>
  );
};

export default NavMenuTrigger;
