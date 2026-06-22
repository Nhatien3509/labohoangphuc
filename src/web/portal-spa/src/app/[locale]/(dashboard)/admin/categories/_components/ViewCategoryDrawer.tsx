"use client";

import { Drawer, Select } from "antd";
import { useEffect, useState } from "react";
import type { ConnectedSystem } from "@/app/[locale]/(dashboard)/admin/categories/_apis/types";
import { Switch } from "@common/components/ui/switch";
import { X } from "@common/components/icons";
import { getConnectedSystemDetail } from "@/app/[locale]/(dashboard)/admin/categories/_apis/actions";
import toast from "@common/components/ui/toast";
import { useTranslations } from "next-intl";

type Props = Readonly<{
  open: boolean;
  id: number | null;
  onOpenChange: (open: boolean) => void;
  onEditClick?: (id: number) => void;
  onDelete?: (id: number) => void;
}>;

export default function ViewCategoryDrawer({
  open,
  id,
  onOpenChange,
  onEditClick,
  onDelete,
}: Props) {
  const t = useTranslations("dashboard.admin.categories");
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ConnectedSystem | null>(null);

  useEffect(() => {
    if (!open || !id) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    getConnectedSystemDetail(id)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          setDetail(res.data);
        } else {
          toast.customError(res.error, res.status, res.statusText);
        }
      })
      .catch(() => {
        /* errors surfaced via toast in .then */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, id]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleEdit = () => {
    if (!id) return;
    onEditClick?.(id);
  };

  const handleDelete = () => {
    if (!id || !onDelete) return;
    onDelete(id);
  };

  const isActive = detail?.status === "ACTIVE";

  let endpointsContent: React.ReactNode;
  if (loading) {
    endpointsContent = (
      <div className="flex flex-1 items-center justify-center py-10 text-[12px] text-[#8e9198] dark:text-neutral-dark-500">
        Đang tải...
      </div>
    );
  } else if (detail?.endpoints?.length) {
    endpointsContent = detail.endpoints.map((ep, idx) => {
      const zebra = idx % 2 === 0 ? "bg-[#fafafa]" : "bg-white";
      return (
        <div
          key={ep.id}
          className={`flex w-full items-stretch ${zebra} dark:bg-neutral-dark-0`}
        >
          <div className="flex h-10 w-[60px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
            {idx + 1}
          </div>
          <div className="flex h-10 w-[120px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
            {ep.type === "ip" ? t("address_type_ip") : t("address_type_domain")}
          </div>
          <div className="flex h-10 w-[110px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
            {ep.protocol ?? ""}
          </div>
          <div className="flex h-10 min-w-0 flex-1 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
            <span className="truncate" title={ep.baseUrl}>
              {ep.baseUrl}
            </span>
          </div>
          <div className="flex h-10 w-[140px] shrink-0 items-center border-b border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
            {ep.port ?? ""}
          </div>
        </div>
      );
    });
  } else {
    endpointsContent = (
      <div className="flex flex-1 items-center justify-center py-10 text-[12px] text-[#8e9198] dark:text-neutral-dark-500">
        {t("empty_data")}
      </div>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      size={1080}
      placement="right"
      destroyOnHidden
      closable={false}
      title={null}
      footer={null}
      focusable={{ trap: false }}
      styles={{
        body: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
        header: { display: "none" },
        wrapper: {
          top: 20,
          bottom: 20,
          height: "calc(100vh - 40px)",
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          overflow: "hidden",
          boxShadow: "0px 10px 14px 0px rgba(15,42,81,0.03)",
        },
      }}
    >
      <div className="flex h-full flex-col bg-white dark:bg-neutral-dark-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#f4f4f4] py-[10px] pl-5 pr-[10px] dark:border-neutral-dark-100">
          <h2 className="text-[14px] font-semibold leading-[14px] text-neutral-900 dark:text-neutral-dark-900">
            Xem chi tiết danh mục phần mềm kết nối
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center rounded-[6px] p-[7px] text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-dark-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 items-stretch overflow-hidden border-t border-[#f4f4f4] dark:border-neutral-dark-100">
          {/* Left: software info */}
          <div className="flex h-full min-h-0 w-[430px] shrink-0 flex-col overflow-y-auto p-5">
            <div className="flex flex-col overflow-hidden rounded-[6px] border border-[#eee] dark:border-neutral-dark-100">
              <div className="flex items-center justify-between border-b border-[#eee] bg-[#f9f9f9] px-5 py-[10px] dark:border-neutral-dark-100 dark:bg-neutral-dark-50">
                <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-neutral-900 dark:text-neutral-dark-900">
                  {t("section_software_info")}
                </span>
              </div>

              <div className="flex flex-col gap-[14px] bg-white p-5 dark:bg-neutral-dark-0">
                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_name")} <span className="text-[#d80d31]">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={detail?.name ?? ""}
                    className="h-[30px] w-full rounded-[6px] border border-[#dcddde] bg-[#f9f9f9] px-3 py-[7px] text-[13px] leading-[14px] text-[#393b40] outline-none dark:border-neutral-dark-300 dark:bg-neutral-dark-50 dark:text-neutral-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_short_name")}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={detail?.shortName ?? ""}
                    className="h-[30px] w-full rounded-[6px] border border-[#dcddde] bg-[#f9f9f9] px-3 py-[7px] text-[13px] leading-[14px] text-[#393b40] outline-none dark:border-neutral-dark-300 dark:bg-neutral-dark-50 dark:text-neutral-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_code")} <span className="text-[#d80d31]">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={detail?.softwareCode ?? ""}
                    className="h-[30px] w-full rounded-[6px] border border-[#dcddde] bg-[#f9f9f9] px-3 py-[7px] text-[13px] leading-[14px] text-[#393b40] outline-none dark:border-neutral-dark-300 dark:bg-neutral-dark-50 dark:text-neutral-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_software_type")}{" "}
                    <span className="text-[#d80d31]">*</span>
                  </label>
                  <Select<string>
                    disabled
                    value={detail?.softwareType ?? undefined}
                    style={{ width: "100%", height: 30 }}
                    options={[
                      { value: "internal", label: "Phần mềm nội bộ" },
                      { value: "external", label: "Phần mềm bên ngoài" },
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_description")}
                  </label>
                  <textarea
                    rows={4}
                    readOnly
                    value={detail?.description ?? ""}
                    className="h-[76px] w-full resize-none rounded-[6px] border border-[#dcddde] bg-[#f9f9f9] px-3 py-2 text-[12px] leading-[20px] text-[#393b40] outline-none dark:border-neutral-dark-300 dark:bg-neutral-dark-50 dark:text-neutral-dark-800"
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_status")}
                  </label>
                  <div className="flex items-center gap-[6px]">
                    <Switch disabled checked={isActive} />
                    <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-[#393b40] dark:text-neutral-dark-800">
                      {isActive ? t("status_active") : t("status_inactive")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: IP/Domain list */}
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto border-l border-[#f4f4f4] p-5 dark:border-neutral-dark-100">
            <div className="flex flex-col overflow-hidden rounded-[6px] border border-[#eee] dark:border-neutral-dark-100">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-[#eee] bg-[#f9f9f9] px-5 py-[10px] dark:border-neutral-dark-100 dark:bg-neutral-dark-50">
                <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-neutral-900 dark:text-neutral-dark-900">
                  {t("section_ip_list")}
                </span>
              </div>

              {/* Table header */}
              <div className="flex w-full items-stretch bg-white dark:bg-neutral-dark-0">
                <div className="flex h-10 w-[60px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  #
                </div>
                <div className="flex h-10 w-[120px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_address_type")}
                </div>
                <div className="flex h-10 w-[110px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_protocol")}
                </div>
                {/* min-w-0 để cột co theo tỷ lệ — thiếu nó thì ô body nở theo
                    nội dung làm đường kẻ header/body lệch nhau */}
                <div className="flex h-10 min-w-0 flex-1 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_address")}
                </div>
                <div className="flex h-10 w-[140px] shrink-0 items-center border-b border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_port")}
                </div>
              </div>

              {/* Rows */}
              {endpointsContent}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-[10px] border-t border-[#f4f4f4] p-5 dark:border-neutral-dark-100">
          <button
            type="button"
            onClick={handleDelete}
            disabled={!detail}
            className="flex h-[34px] items-center justify-center rounded-[6px] border border-[#dcddde] bg-white px-3 py-[11px] text-[12px] font-medium leading-[12px] text-[#2c2d30] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:text-neutral-dark-700"
          >
            {t("action_delete")}
          </button>
          <button
            type="button"
            onClick={handleEdit}
            disabled={!detail}
            className="flex h-[34px] items-center justify-center rounded-[6px] bg-[#1379f0] px-3 py-[11px] text-[12px] font-medium leading-[12px] text-white hover:opacity-90 disabled:opacity-60"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </Drawer>
  );
}
