"use client";

import { useEffect, useRef } from "react";
import { shallow } from "zustand/shallow";
import { useS3Uploader } from "@common/hooks/useS3Uploader";
import { useUploadStore } from "@common/components/layout/providers/uploadStore";
import { useUploadUnloadGuard } from "@common/hooks/useUploadUnloadGuard";

/**
 * Một Engine tương ứng với một engineKey (ví dụ: `${region}:${bucket}`).
 * Engine này sở hữu một instance useS3Uploader với opts lấy từ store
 * và bind các API (start/cancel/retry) + callback progress vào store.
 */
function Engine({ engineKey }: { engineKey: string }) {
  const { engineOpts, bindEngineAPI, upsertBatch, setProgress, setStatus } =
    useUploadStore((s) => ({
      engineOpts: s.engineOpts,
      bindEngineAPI: s.bindEngineAPI,
      upsertBatch: s.upsertBatch,
      setProgress: s.setProgress,
      setStatus: s.setStatus,
    }));

  const opts = engineOpts[engineKey];
  if (!opts) return null; // engineKey đã bị remove hoặc chưa sẵn sàng

  const { uploadFiles, cancelFile, retryFile } = useS3Uploader({
    ...opts,
    onStartUpload: (rows) => {
      upsertBatch(
        rows.map((r) => ({
          id: r.id,
          uid: r.uid,
          key: r.key,
          name: r.name,
          size: r.size,
          partCount: r.partCount,
          percent: 0,
          status: "uploading",
        })),
        engineKey,
      );
    },
    onFileProgress: ({
      id,
      percent,
      uploadedBytesApprox,
      totalBytes,
      uploadId,
    }) => {
      setProgress(id, percent, uploadedBytesApprox, totalBytes, uploadId);
    },
    onFileDone: ({ id }) => {
      setStatus(id, "done");
    },
    onFileError: ({ id, error }) => {
      setStatus(id, "error", error.message);
    },
    onFileCanceled: ({ id }) => {
      setStatus(id, "canceled");
    },
  });

  // ---- Stable proxies để tránh re-bind vô hạn ----
  const startRef = useRef(uploadFiles);
  const cancelRef = useRef(cancelFile);
  const retryRef = useRef(retryFile);

  // Luôn cập nhật ref khi function reference thay đổi
  useEffect(() => {
    startRef.current = uploadFiles;
  }, [uploadFiles]);
  useEffect(() => {
    cancelRef.current = cancelFile;
  }, [cancelFile]);
  useEffect(() => {
    retryRef.current = retryFile;
  }, [retryFile]);

  // Bind 1 lần khi mount: dùng proxy gọi .current
  useEffect(() => {
    bindEngineAPI(engineKey, {
      start: (payload) => startRef.current(payload),
      cancel: (id) => cancelRef.current(id),
      retry: (id) => retryRef.current(id),
    });
    // CHỈ phụ thuộc engineKey & bindEngineAPI để bind 1 lần
  }, [engineKey, bindEngineAPI]);

  return null;
}

export default function UploadHost() {
  const engineKeys = useUploadStore((s) => Object.keys(s.engineOpts), shallow);
  const gcCompleted = useUploadStore((s) => s.gcCompleted);
  const gcEngines = useUploadStore((s) => s.gcEngines);
  useUploadUnloadGuard();

  // GC interval
  const timeToCleanUploadItemsStateRef = useRef<number | null>(null);
  const timeToCleanUnuseEngineRef = useRef<number | null>(null);
  useEffect(() => {
    const timeToCleanUploadItemsState = 60000; // 60s
    const timeToCleanUnuseEngine = 10 * timeToCleanUploadItemsState; // 10min
    timeToCleanUploadItemsStateRef.current = window.setInterval(() => {
      gcCompleted(timeToCleanUploadItemsState);
    }, 30000); // mỗi 30s dọn 1 lần

    timeToCleanUnuseEngineRef.current = window.setInterval(() => {
      gcEngines(timeToCleanUnuseEngine);
    }, 60000); // mỗi 60s dọn 1 lần

    return () => {
      if (timeToCleanUploadItemsStateRef.current)
        window.clearInterval(timeToCleanUploadItemsStateRef.current);
      if (timeToCleanUnuseEngineRef.current)
        window.clearInterval(timeToCleanUnuseEngineRef.current);
    };
  }, [gcCompleted, gcEngines]);

  return (
    <>
      {engineKeys.map((key) => (
        <Engine key={key} engineKey={key} />
      ))}
    </>
  );
}
