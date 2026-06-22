"use client";

import { Warning, X } from "@common/components/icons";
import { Modal } from "antd";

type Props = Readonly<{
  open: boolean;
  title?: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

// Modal xác nhận dùng chung (xóa / tạm dừng / thu hồi...): tiêu đề + nút X,
// icon cảnh báo đỏ trong vòng tròn hồng, nội dung, footer Hủy / Đồng ý.
export default function ConfirmModal({
  open,
  title = "Xác nhận Xóa",
  content,
  confirmText = "Đồng ý",
  cancelText = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      title={null}
      centered
      width={520}
      mask={{ closable: !loading }}
      styles={{ body: { padding: 0 } }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-[#f4f4f4] px-3 py-2 dark:border-neutral-dark-100">
          <h3 className="text-[16px] font-semibold leading-[20px] text-neutral-900 dark:text-neutral-dark-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="flex items-center rounded-[6px] p-[6px] text-neutral-500 hover:bg-neutral-50 disabled:opacity-60 dark:hover:bg-neutral-dark-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-5 px-3 pb-3 pt-4">
          <span className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-primary-50 dark:bg-[#3a1418]">
            <Warning size={36} />
          </span>
          <p className="text-center text-[16px] leading-[22px] text-neutral-900 dark:text-neutral-dark-900">
            {content}
          </p>
        </div>

        <div className="flex items-center gap-3 px-3 pb-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-[40px] flex-1 items-center justify-center rounded-[6px] border border-[#dcddde] bg-white text-[13px] font-medium text-[#2c2d30] hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-dark-300 dark:bg-neutral-dark-0 dark:text-neutral-dark-700"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-[40px] flex-1 items-center justify-center rounded-[6px] bg-blue-700 text-[13px] font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
