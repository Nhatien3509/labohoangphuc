import DocumentationButton from "@common/components/layout/buttons/DocumentationButton";
import LocaleSwitch from "@common/components/layout/buttons/LocaleSwitch";
import Logo from "@common/components/layout/Logo";
import NavigationLoadingBar from "@common/components/layout/loading/NavigationLoadingBar";
import SearchBarContainer from "@common/components/layout/searchbar/SearchBarContainer";
import ThemeSwitch from "@common/components/layout/buttons/ThemeSwitch";
import UserNav from "@common/components/layout/user-nav/UserNav";

import { type SessionData, getSession } from "@common/lib/core/auth";
import { cn } from "@common/lib/core/utils";
import { getFeatureFlags } from "@common/lib/feature-flags/server";

export default async function Header() {
  const { isLoggedIn } = await getSession<SessionData>("session");
  const isThemeSwitchEnabled = getFeatureFlags("themeSwitch.enabled");

  return (
    <header
      className={cn(
        "sticky top-0 z-[40] flex items-center justify-between bg-neutral-0 px-6 shadow-D-X0-Y2-B4-S0-15 dark:bg-neutral-dark-0",
        "py-2.5 max-xl:py-0",
        "h-[4.125rem] max-lg:h-[3.75rem]",
      )}
    >
      <Logo isLoggedIn={isLoggedIn} />

      <div className="flex w-full items-center justify-end gap-6 max-lg:w-fit">
        <div className="flex items-center gap-4">
          <SearchBarContainer />
          <DocumentationButton />
          {isThemeSwitchEnabled && <ThemeSwitch />}
        </div>
        <div className="flex items-center justify-around gap-6">
          <LocaleSwitch />
          <UserNav />
        </div>
      </div>
      <NavigationLoadingBar />
    </header>
  );
}
