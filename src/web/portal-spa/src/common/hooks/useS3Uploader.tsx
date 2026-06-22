// Stub — object-storage module removed
import type {
  EngineOpts,
  StartPayload,
} from "@common/components/layout/providers/uploadStore";

type UseS3UploaderCallbacks = {
  onStartUpload?: (
    rows: {
      id: string;
      uid?: string;
      key: string;
      name: string;
      size: number;
      partCount: number;
    }[],
  ) => void;
  onFileProgress?: (args: {
    id: string;
    percent: number;
    uploadedBytesApprox: number;
    totalBytes: number;
    uploadId?: string;
  }) => void;
  onFileDone?: (args: { id: string }) => void;
  onFileError?: (args: { id: string; error: Error }) => void;
  onFileCanceled?: (args: { id: string }) => void;
};

export function useS3Uploader(_opts: EngineOpts & UseS3UploaderCallbacks): {
  uploadFiles: (payload: StartPayload) => Promise<void>;
  cancelFile: (id: string) => Promise<void>;
  retryFile: (id: string) => Promise<void>;
} {
  return {
    uploadFiles: () => Promise.resolve(),
    cancelFile: () => Promise.resolve(),
    retryFile: () => Promise.resolve(),
  };
}
