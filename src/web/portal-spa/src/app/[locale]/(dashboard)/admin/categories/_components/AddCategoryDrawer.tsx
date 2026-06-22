"use client";

import { Delete, Plus, X } from "@common/components/icons";
import { Drawer, Select } from "antd";
import {
  checkConnectedSystemDuplicate,
  createConnectedSystem,
  getConnectedSystemDetail,
  updateConnectedSystem,
} from "@/app/[locale]/(dashboard)/admin/categories/_apis/actions";
import { useEffect, useRef, useState, useTransition } from "react";
import { Switch } from "@common/components/ui/switch";
import type { UpdateEndpointPayload } from "@/app/[locale]/(dashboard)/admin/categories/_apis/types";
import { focusFirstInvalidField } from "@common/lib/helpers/form";
import toast from "@common/components/ui/toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = Readonly<{
  open?: boolean;
  editId?: number | null;
  onOpenChange: (open: boolean) => void;
}>;

type AddressType = "" | "IP" | "Domain";
type ProtocolValue = "" | "http" | "https";

type IpRow = {
  id: string;
  addressType: AddressType;
  protocol: ProtocolValue;
  address: string;
  port: string;
};

const createRow = (): IpRow => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  addressType: "",
  protocol: "",
  address: "",
  port: "",
});

export default function AddCategoryDrawer({
  open,
  editId,
  onOpenChange,
}: Props) {
  const t = useTranslations("dashboard.admin.categories");
  const router = useRouter();
  const isEdit = editId !== null && editId !== undefined;
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [code, setCode] = useState("");
  const [softwareType, setSoftwareType] = useState<string | undefined>(
    undefined,
  );
  const [managingUnit, setManagingUnit] = useState<string | undefined>(
    undefined,
  );
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [rows, setRows] = useState<IpRow[]>(() =>
    isEdit ? [] : [createRow()],
  );
  const [errors, setErrors] = useState<{
    name?: string;
    code?: string;
    softwareType?: string;
    endpoints?: string;
  }>({});
  const [originalCode, setOriginalCode] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  // Vùng cuộn chứa toàn bộ trường — để focus trường bắt buộc lỗi khi submit.
  const scrollRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setName("");
    setShortName("");
    setCode("");
    setSoftwareType(undefined);
    setManagingUnit(undefined);
    setDescription("");
    setActive(true);
    setRows([createRow()]);
    setErrors({});
    setOriginalCode("");
    setIsCheckingCode(false);
  };

  const handleCodeBlur = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    if (isEdit && trimmed === originalCode) return;
    setIsCheckingCode(true);
    try {
      const res = await checkConnectedSystemDuplicate(
        trimmed,
        isEdit && editId ? editId : undefined,
      );
      if (res.success && res.data?.existed) {
        setErrors((prev) => ({ ...prev, code: "Mã phần mềm đã tồn tại" }));
      }
    } finally {
      setIsCheckingCode(false);
    }
  };

  useEffect(() => {
    if (!open || !isEdit || !editId) return;
    let cancelled = false;
    getConnectedSystemDetail(editId)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const d = res.data;
          setName(d.name);
          setShortName(d.shortName ?? "");
          setCode(d.softwareCode);
          setOriginalCode(d.softwareCode);
          setSoftwareType(d.softwareType);
          setDescription(d.description);
          setActive(d.status === "ACTIVE");
          setRows(
            (d.endpoints ?? []).map((ep) => ({
              id: String(ep.id),
              addressType: ep.type === "ip" ? "IP" : "Domain",
              protocol: ep.protocol ?? "",
              address: ep.baseUrl,
              port: ep.port != null ? String(ep.port) : "",
            })),
          );
        } else {
          toast.customError(res.error, res.status, res.statusText);
        }
      })
      .catch(() => {
        /* errors surfaced via toast in .then */
      });
    return () => {
      cancelled = true;
    };
  }, [open, isEdit, editId]);

  const handleClose = () => {
    if (isPending) return;
    resetForm();
    onOpenChange(false);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, createRow()]);
    if (errors.endpoints)
      setErrors((prev) => ({ ...prev, endpoints: undefined }));
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (id: string, patch: Partial<IpRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    if (errors.endpoints)
      setErrors((prev) => ({ ...prev, endpoints: undefined }));
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();

    const validEndpoints: UpdateEndpointPayload[] = [];
    rows.forEach((row, idx) => {
      const address = row.address.trim();
      if (
        !address ||
        (row.addressType !== "IP" && row.addressType !== "Domain") ||
        (row.protocol !== "http" && row.protocol !== "https")
      ) {
        return;
      }
      const portNum = row.port ? Number(row.port) : 0;
      const existingId = /^\d+$/.test(row.id) ? Number(row.id) : undefined;
      validEndpoints.push({
        ...(existingId !== undefined ? { id: existingId } : {}),
        baseUrl: address,
        type: row.addressType === "IP" ? "ip" : "domain",
        port: Number.isFinite(portNum) && portNum > 0 ? portNum : undefined,
        protocol: row.protocol,
        priority: idx + 1,
        method: "POST",
      });
    });

    const nextErrors: typeof errors = {};
    if (!trimmedName) nextErrors.name = t("validation_name_required");
    if (!trimmedCode) nextErrors.code = t("validation_code_required");
    if (!softwareType)
      nextErrors.softwareType = t("validation_software_type_required");
    if (validEndpoints.length === 0)
      nextErrors.endpoints = t("validation_endpoint_required");

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      // Cuộn + focus tới trường bắt buộc lỗi đầu tiên (theo thứ tự trên form).
      focusFirstInvalidField(
        scrollRef.current,
        ["name", "code", "softwareType", "endpoints"].filter(
          (k) => nextErrors[k as keyof typeof nextErrors],
        ),
      );
      return;
    }
    setErrors({});

    const trimmedShortName = shortName.trim() || undefined;
    const trimmedDescription = description.trim() || undefined;

    startTransition(async () => {
      const res =
        isEdit && editId
          ? await updateConnectedSystem(editId, {
              name: trimmedName,
              softwareCode: trimmedCode,
              shortName: trimmedShortName,
              softwareType,
              description: trimmedDescription,
              status: active ? ("ACTIVE" as const) : ("INACTIVE" as const),
              endpoints: validEndpoints,
            })
          : await createConnectedSystem({
              name: trimmedName,
              softwareCode: trimmedCode,
              shortName: trimmedShortName,
              softwareType,
              description: trimmedDescription,
              status: active ? ("ACTIVE" as const) : ("INACTIVE" as const),
              endpoints: validEndpoints.map(({ id: _id, ...rest }) => rest),
            });

      if (res.success) {
        toast.success(isEdit ? "Cập nhật thành công" : t("create_success"));
        resetForm();
        onOpenChange(false);
        router.refresh();
      } else {
        toast.customError(res.error, res.status, res.statusText);
      }
    });
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      size="calc(1080px + 10vw)"
      placement="right"
      destroyOnHidden
      closable={false}
      title={null}
      footer={null}
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
            {isEdit
              ? "Cập nhật danh mục phần mềm kết nối"
              : t("add_dialog_title")}
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
        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 items-stretch overflow-hidden border-t border-[#f4f4f4] dark:border-neutral-dark-100"
        >
          {/* Left: software info */}
          <div className="flex h-full min-h-0 w-[430px] shrink-0 flex-col overflow-y-auto p-5">
            <div className="flex flex-col overflow-hidden rounded-[6px] border border-[#eee] dark:border-neutral-dark-100">
              <div className="flex items-center justify-between border-b border-[#eee] bg-[#f9f9f9] px-5 py-[10px] dark:border-neutral-dark-100 dark:bg-neutral-dark-50">
                <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-neutral-900 dark:text-neutral-dark-900">
                  {t("section_software_info")}
                </span>
              </div>

              <div className="flex flex-col gap-[14px] bg-white p-5 dark:bg-neutral-dark-0">
                <div className="flex flex-col gap-[6px]" data-field="name">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_name")} <span className="text-[#d80d31]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled={isEdit}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder={t("field_name_placeholder")}
                    className={`h-[30px] w-full rounded-[6px] border bg-white px-3 py-[7px] text-[12px] leading-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#8e9198] focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-[#f9f9f9] disabled:text-[#676a72] dark:bg-neutral-dark-0 ${
                      errors.name
                        ? "border-[#d80d31]"
                        : "border-[#dcddde] dark:border-neutral-dark-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[12px] leading-[14px] text-[#d80d31]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_short_name")}
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    disabled={isEdit}
                    onChange={(e) => {
                      setShortName(e.target.value);
                    }}
                    placeholder={t("field_short_name_placeholder")}
                    className="h-[30px] w-full rounded-[6px] border border-[#dcddde] bg-white px-3 py-[7px] text-[12px] leading-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#8e9198] focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-[#f9f9f9] disabled:text-[#676a72] dark:border-neutral-dark-300 dark:bg-neutral-dark-0"
                  />
                </div>

                <div className="flex flex-col gap-[6px]" data-field="code">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_code")} <span className="text-[#d80d31]">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    disabled={isEdit}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errors.code)
                        setErrors((prev) => ({ ...prev, code: undefined }));
                    }}
                    onBlur={() => {
                      void handleCodeBlur();
                    }}
                    placeholder={t("field_code_placeholder")}
                    className={`h-[30px] w-full rounded-[6px] border bg-white px-3 py-[7px] text-[12px] leading-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#8e9198] focus:border-blue-300 disabled:cursor-not-allowed disabled:bg-[#f9f9f9] disabled:text-[#676a72] dark:bg-neutral-dark-0 ${
                      errors.code
                        ? "border-[#d80d31]"
                        : "border-[#dcddde] dark:border-neutral-dark-300"
                    }`}
                  />
                  {errors.code && (
                    <p className="text-[12px] leading-[14px] text-[#d80d31]">
                      {errors.code}
                    </p>
                  )}
                  {!errors.code && isCheckingCode && (
                    <p className="text-[12px] leading-[14px] text-[#8e9198]">
                      Đang kiểm tra...
                    </p>
                  )}
                </div>

                <div
                  className="flex flex-col gap-[6px]"
                  data-field="softwareType"
                >
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_software_type")}{" "}
                    <span className="text-[#d80d31]">*</span>
                  </label>
                  <Select<string>
                    value={softwareType}
                    disabled={isEdit}
                    onChange={(v) => {
                      setSoftwareType(v);
                      if (errors.softwareType)
                        setErrors((prev) => ({
                          ...prev,
                          softwareType: undefined,
                        }));
                    }}
                    placeholder={t("field_software_type_placeholder")}
                    status={errors.softwareType ? "error" : undefined}
                    style={{ width: "100%", height: 30, fontSize: 12 }}
                    options={[
                      { value: "internal", label: "Phần mềm nội bộ" },
                      { value: "external", label: "Phần mềm bên ngoài" },
                    ]}
                  />
                  {errors.softwareType && (
                    <p className="text-[12px] leading-[14px] text-[#d80d31]">
                      {errors.softwareType}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_managing_unit")}
                  </label>
                  <Select<string>
                    value={managingUnit}
                    disabled
                    onChange={setManagingUnit}
                    placeholder={t("field_managing_unit_placeholder")}
                    style={{ width: "100%", height: 30, fontSize: 12 }}
                    options={[]}
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_description")}
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    placeholder={t("field_description_placeholder")}
                    className="h-[76px] w-full resize-none rounded-[6px] border border-[#dcddde] bg-white px-3 py-2 text-[12px] leading-[20px] shadow-[1px_1px_2px_0px_#f8fafb] outline-none placeholder:text-[#8e9198] focus:border-blue-300 dark:border-neutral-dark-300 dark:bg-neutral-dark-0"
                  />
                </div>

                <div className="flex flex-col gap-[10px]">
                  <label className="text-[12px] font-medium leading-[12px] text-neutral-900 dark:text-neutral-dark-900">
                    {t("field_status")}
                  </label>
                  <div className="flex items-center gap-[6px]">
                    <Switch checked={active} onCheckedChange={setActive} />
                    <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-[#393b40] dark:text-neutral-dark-800">
                      {active ? t("status_active") : t("status_inactive")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: IP/Domain list */}
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto border-l border-[#f4f4f4] p-5 dark:border-neutral-dark-100">
            <div
              data-field="endpoints"
              className={`flex flex-col overflow-hidden rounded-[6px] border dark:border-neutral-dark-100 ${
                errors.endpoints ? "border-[#d80d31]" : "border-[#eee]"
              }`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-[#eee] bg-[#f9f9f9] px-5 py-2 dark:border-neutral-dark-100 dark:bg-neutral-dark-50">
                <span className="text-[13px] font-medium leading-[14px] -tracking-[0.13px] text-neutral-900 dark:text-neutral-dark-900">
                  {t("section_ip_list")}
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex h-[28px] shrink-0 items-center justify-center gap-1 rounded-[6px] bg-[#1379f0] px-[10px] py-[7px] text-[11px] font-medium leading-[12px] text-white hover:opacity-90"
                >
                  <Plus size={14} />
                  {t("add_new")}
                </button>
              </div>

              {/* Table header */}
              <div className="flex w-full items-stretch bg-white dark:bg-neutral-dark-0">
                <div className="flex h-10 w-[50px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] dark:border-neutral-dark-100">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] cursor-pointer rounded-[4px] border-[#dcddde]"
                  />
                </div>
                <div className="flex h-10 w-[37px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  #
                </div>
                <div className="flex h-10 w-[120px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_address_type")}
                </div>
                <div className="flex h-10 w-[110px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_protocol")}
                </div>
                <div className="flex h-10 min-w-0 flex-[3] items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_address")}
                </div>
                <div className="flex h-10 min-w-0 flex-1 items-center border-b border-r border-[#f4f4f4] px-[14px] text-[13px] leading-[14px] text-[#676a72] dark:border-neutral-dark-100">
                  {t("dialog_col_port")}
                </div>
                <div className="h-10 w-[44px] shrink-0 border-b border-[#f4f4f4] dark:border-neutral-dark-100" />
              </div>

              {/* Rows / Empty state */}
              {rows.length === 0 ? (
                <div className="flex flex-1 flex-col items-center gap-2 py-10">
                  <svg
                    width="52"
                    height="52"
                    viewBox="0 0 52 52"
                    fill="none"
                    className="text-neutral-300 dark:text-neutral-dark-300"
                  >
                    <rect
                      x="8"
                      y="14"
                      width="36"
                      height="28"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M8 22h36" stroke="currentColor" strokeWidth="2" />
                    <circle
                      cx="26"
                      cy="31"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M26 28v3l2 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[12px] leading-[16px] text-[#8e9198] dark:text-neutral-dark-500">
                    {t("empty_data")}
                  </span>
                </div>
              ) : (
                rows.map((row, idx) => {
                  const zebra = idx % 2 === 0 ? "bg-[#fafafa]" : "bg-white";
                  const disabled = !row.addressType;
                  let addressPlaceholder = "";
                  if (row.addressType === "IP")
                    addressPlaceholder = "   .   .   .";
                  else if (row.addressType === "Domain")
                    addressPlaceholder = t("enter_domain");
                  return (
                    <div
                      key={row.id}
                      className={`flex w-full items-stretch ${zebra} dark:bg-neutral-dark-0`}
                    >
                      <div className="flex h-10 w-[50px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] dark:border-neutral-dark-100">
                        <input
                          type="checkbox"
                          className="h-[18px] w-[18px] cursor-pointer rounded-[4px] border-[#dcddde]"
                        />
                      </div>
                      <div className="flex h-10 w-[37px] shrink-0 items-center justify-center border-b border-r border-[#f4f4f4] text-[13px] leading-[14px] text-[#393b40] dark:border-neutral-dark-100">
                        {idx + 1}
                      </div>
                      <div className="flex h-10 w-[120px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] py-[10px] dark:border-neutral-dark-100">
                        <Select<AddressType>
                          size="small"
                          value={row.addressType || undefined}
                          onChange={(v) => {
                            handleUpdateRow(row.id, { addressType: v });
                          }}
                          placeholder={t("address_type_placeholder")}
                          style={{ width: "100%", fontSize: 12 }}
                          options={[
                            { value: "IP", label: t("address_type_ip") },
                            {
                              value: "Domain",
                              label: t("address_type_domain"),
                            },
                          ]}
                        />
                      </div>
                      <div className="flex h-10 w-[110px] shrink-0 items-center border-b border-r border-[#f4f4f4] px-[14px] py-[10px] dark:border-neutral-dark-100">
                        <Select<ProtocolValue>
                          size="small"
                          disabled={disabled}
                          value={row.protocol || undefined}
                          onChange={(v) => {
                            handleUpdateRow(row.id, { protocol: v });
                          }}
                          placeholder={t("protocol_placeholder")}
                          style={{ width: "100%", fontSize: 12 }}
                          options={[
                            { value: "http", label: "HTTP" },
                            { value: "https", label: "HTTPS" },
                          ]}
                        />
                      </div>
                      <div className="flex h-10 min-w-0 flex-[3] items-center border-b border-r border-[#f4f4f4] px-[14px] py-[10px] dark:border-neutral-dark-100">
                        <input
                          type="text"
                          disabled={disabled}
                          value={row.address}
                          onChange={(e) => {
                            handleUpdateRow(row.id, {
                              address: e.target.value,
                            });
                          }}
                          placeholder={addressPlaceholder}
                          className={`h-[30px] w-full rounded-[6px] border border-[#dcddde] px-[10px] py-[7px] text-[12px] leading-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#8e9198] focus:border-blue-300 disabled:bg-[#f9f9f9] dark:border-neutral-dark-300 ${
                            disabled
                              ? "bg-[#f9f9f9]"
                              : "bg-white dark:bg-neutral-dark-0"
                          }`}
                        />
                      </div>
                      <div className="flex h-10 min-w-0 flex-1 items-center border-b border-r border-[#f4f4f4] px-[14px] py-[10px] dark:border-neutral-dark-100">
                        <input
                          type="text"
                          disabled={disabled}
                          value={row.port}
                          onChange={(e) => {
                            handleUpdateRow(row.id, { port: e.target.value });
                          }}
                          className={`h-[30px] w-full rounded-[6px] border border-[#dcddde] px-[10px] py-[7px] text-[12px] leading-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#8e9198] focus:border-blue-300 disabled:bg-[#f9f9f9] dark:border-neutral-dark-300 ${
                            disabled
                              ? "bg-[#f9f9f9]"
                              : "bg-white dark:bg-neutral-dark-0"
                          }`}
                        />
                      </div>
                      <div className="flex h-10 w-[44px] shrink-0 items-center justify-center border-b border-[#f4f4f4] dark:border-neutral-dark-100">
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveRow(row.id);
                          }}
                          className="flex items-center rounded-[6px] p-[6px] text-[#676a72] hover:bg-neutral-100 dark:hover:bg-neutral-dark-50"
                          aria-label="Delete"
                        >
                          <Delete size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {errors.endpoints && (
              <p className="mt-[6px] text-[12px] leading-[14px] text-[#d80d31]">
                {errors.endpoints}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[#f4f4f4] p-5 dark:border-neutral-dark-100">
          <div />
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex h-[34px] items-center justify-center rounded-[6px] border border-[#dcddde] bg-white px-3 py-[11px] text-[12px] font-medium leading-[12px] text-[#2c2d30] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.08)] hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:text-neutral-dark-700"
            >
              {t("action_cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex h-[34px] items-center justify-center rounded-[6px] bg-[#1379f0] px-3 py-[11px] text-[12px] font-medium leading-[12px] text-white hover:opacity-90 disabled:opacity-60"
            >
              {t("action_save")}
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
