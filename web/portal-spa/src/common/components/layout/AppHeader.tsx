import Link from "next/link";

import { getSessionClaims } from "@/api/session";
import { ThemeToggle } from "@common/components/layout/ThemeToggle";
import { UserMenu } from "@common/components/layout/UserMenu";
import { Button } from "@common/components/ui/button";

export function AppHeader() {
  const claims = getSessionClaims();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="text-sm text-muted-foreground">Trang quản trị</div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/tra-cuu">Trang tra cứu</Link>
        </Button>
        <ThemeToggle />
        <UserMenu role={claims?.role} />
      </div>
    </header>
  );
}
