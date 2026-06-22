import { useMemo, useRef } from "react";
import { UUID_REGEX } from "@common/lib/core/const";

export const useRowSelection = <T extends { id: string }>(
  selectedRows: Record<string, boolean>,
  currentPageData: T[],
  initSelected: T[] = [],
  isCheckingUUID = true,
) => {
  // 1. Khởi tạo cache (Lưu ý: Phải gọi hàm IIFE () để gán object, không gán function)
  const cacheRef = useRef<Record<string, T>>(
    (() => {
      const initCache: Record<string, T> = {};
      initSelected.forEach((item) => {
        initCache[item.id] = item;
      });
      return initCache;
    })(),
  );

  const prevPageDataRef = useRef<Record<string, T>>({});

  const currentPageDataToObject = useMemo(() => {
    const result: Record<string, T> = {};
    currentPageData.forEach((item) => {
      result[item.id] = item;
    });
    return result;
  }, [currentPageData]);

  const currentSelected = useMemo(() => {
    const prevData = prevPageDataRef.current;
    const currentIds = new Set(Object.keys(currentPageDataToObject));
    const prevIds = new Set(Object.keys(prevData));

    // Kiểm tra xem có đang ở cùng một trang không (có sự trùng lặp ID)
    const hasOverlap =
      prevIds.size > 0 &&
      currentIds.size > 0 &&
      [...prevIds].some((id) => currentIds.has(id));

    // --- LOGIC QUAN TRỌNG: XỬ LÝ XOÁ ITEM HOẶC CHUYỂN TRANG ---
    if (hasOverlap) {
      // Nếu đang ở CÙNG MỘT TRANG mà data thay đổi (ví dụ: bị xoá)
      const updatedCache: Record<string, T> = {};
      Object.entries(cacheRef.current).forEach(([id, item]) => {
        // Chỉ giữ item trong cache nếu:
        // 1. Nó thuộc về trang khác (chưa từng xuất hiện ở prevIds)
        // 2. Nó nằm ở trang này và HIỆN TẠI VẪN CÒN (currentIds.has(id))
        if (!prevIds.has(id) || currentIds.has(id)) {
          updatedCache[id] = item;
        }
      });
      cacheRef.current = updatedCache;
    } else if (prevIds.size > 0) {
      // Nếu CHUYỂN SANG TRANG KHÁC hoàn toàn: Cache lại những thằng đang được tick ở trang cũ
      prevIds.forEach((id) => {
        if (selectedRows[id] && prevData[id]) {
          cacheRef.current[id] = prevData[id];
        }
      });
    }

    // Cập nhật lại data trang cũ cho lần render kế tiếp
    prevPageDataRef.current = currentPageDataToObject;

    // --- LỌC VÀ TRẢ VỀ KẾT QUẢ ---
    const validSelectedIds = Object.keys(selectedRows).filter(
      (id) => selectedRows[id] && (!isCheckingUUID || UUID_REGEX.test(id)),
    );

    const newCache: Record<string, T> = {};
    const result: T[] = [];

    validSelectedIds.forEach((id) => {
      const itemData = currentPageDataToObject[id] ?? cacheRef.current[id];

      if (itemData) {
        result.push(itemData);
        newCache[id] = itemData;
      }
    });

    cacheRef.current = newCache;

    return result;
  }, [selectedRows, currentPageDataToObject, isCheckingUUID]);

  return { currentSelected };
};
