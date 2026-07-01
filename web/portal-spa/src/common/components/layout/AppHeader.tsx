import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { getSessionClaims } from "@/api/session";
import { MobileSidebar } from "@common/components/layout/MobileSidebar";
import { ThemeToggle } from "@common/components/layout/ThemeToggle";
import { UserMenu } from "@common/components/layout/UserMenu";
import { Button } from "@common/components/ui/button";

export function AppHeader() {
  const claims = getSessionClaims();

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />
        <span className="truncate text-sm text-muted-foreground">
          Trang quản trị
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/tra-cuu">
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Trang tra cứu</span>
          </Link>
        </Button>
        <ThemeToggle />
        <UserMenu role={claims?.role} />
      </div>
    </header>
  );
}
