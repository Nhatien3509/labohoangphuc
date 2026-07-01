"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { useState } from "react";

import { Button } from "@common/components/ui/button";

import { SidebarBrand, SidebarNav } from "./AppSidebar";

/**
 * Điều hướng admin trên mobile/tablet: nút hamburger mở drawer trượt từ trái.
 * Chỉ hiển thị dưới breakpoint md (sidebar cố định lo phần desktop).
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80%] flex-col border-r border-border bg-card shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden">
          <DialogPrimitive.Title className="sr-only">
            Điều hướng quản trị
          </DialogPrimitive.Title>
          <div className="relative">
            <SidebarBrand />
            <DialogPrimitive.Close
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
