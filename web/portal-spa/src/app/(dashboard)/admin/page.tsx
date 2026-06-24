import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@common/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">
          Trang quản trị thẻ bảo hành Labo Hoàng Phúc.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/warranty-cards">
          <Card className="transition-colors hover:border-primary">
            <CardHeader>
              <CardTitle>Thẻ bảo hành</CardTitle>
              <CardDescription>
                Xem danh sách và phát hành thẻ bảo hành mới.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-primary">
              Đi tới quản lý →
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
