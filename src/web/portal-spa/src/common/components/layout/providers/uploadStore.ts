"use client";

// Inlined from deleted object-storage/types
type Acl = string;
import { type StorageClass } from "@aws-sdk/client-s3";
import { createStore } from "zustand/vanilla";
import { useStoreWithEqualityFn } from "zustand/traditional";

export type UploadStatus =
  | "queued"
  | "uploading"
  | "done"
  | "error"
  | "canceled";

export type UploadItem = {
  id: string;
  uid?: string;
  engineKey: string;
  key: string;
  name: string;
  size: number;
  uploadId?: string;
  partCount: number;
  percent: number;
  status: UploadStatus;
  error?: string;
  completedAt?: number;
  uploadedBytes?: number;
};

export type FileJob = {
  uid?: string;
  name: string;
  size: number;
  type: string;
  file: File;
  key: string;
};

export type EngineOpts = {
  endpoint: string;
  region: string;
  bucket: string;
  forcePathStyle?: boolean;
  credentialsProvider: () => Promise<
    { accessKeyId: string; secretAccessKey: string } | undefined
  >;
};

export type UserMeta = Record<string, string | undefined>;

export type StartPayload = {
  jobs: FileJob[];
  acl: Acl;
  storageClass: StorageClass;
  contentType: string;
  extendsMetadata: UserMeta;
  currentPath?: string;
};

export type EngineAPI = {
  start: (payload: StartPayload) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
};

type EngineMeta = {
  lastUsed: number;
};

type UploadState = {
  engineOpts: Record<string, EngineOpts>;
  engines: Record<string, EngineAPI | undefined>;
  items: Record<string, UploadItem>;
  pinnedBatches: Record<string, number>;
  engineMeta: Record<string, EngineMeta>;
};

type UploadActions = {
  ensureEngine: (key: string, opts: EngineOpts) => void;
  bindEngineAPI: (key: string, api: EngineAPI) => void;
  upsertBatch: (
    rows: Omit<UploadItem, "engineKey">[],
    engineKey: string,
  ) => void;
  setProgress: (
    id: string,
    percent: number,
    uploadedBytes: number,
    totalBytes: number,
    uploadId?: string,
  ) => void;
  setStatus: (id: string, status: UploadStatus, errorMsg?: string) => void;
  remove: (id: string) => void;
  reset: () => void;

  startOn: (key: string, payload: StartPayload) => Promise<void>;
  cancelOn: (key: string, id: string) => Promise<void>;
  retryOn: (key: string, id: string) => Promise<void>;
  pruneCompletedForBatch: (batchId: string) => void;
  pinBatch: (batchId: string) => void;
  unpinBatch: (batchId: string) => void;
  gcCompleted: (olderThanMs: number) => void;
  gcEngines: (olderThanMs: number) => void;
  cancelAll: () => Promise<void>;
};

export type UploadStore = UploadState & UploadActions;

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

async function waitFor<T>(
  fn: () => T | undefined,
  {
    tries = 200,
    intervalMs = 25,
  }: { tries?: number; intervalMs?: number } = {},
): Promise<T> {
  for (let i = 0; i < tries; i++) {
    const v = fn();
    if (v !== undefined) return v;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("Engine is not ready yet");
}

const defaultInitState: UploadState = {
  engineOpts: {},
  engines: {},
  items: {},
  pinnedBatches: {},
  engineMeta: {},
};

const uploadStore = createStore<UploadStore>()((set, get) => ({
  ...defaultInitState,

  ensureEngine: (engineKey, opts) => {
    set((s) => {
      const prev = s.engineOpts[engineKey];
      const nextOpts = prev
        ? { ...s.engineOpts, [engineKey]: { ...prev, ...opts } }
        : { ...s.engineOpts, [engineKey]: opts };

      const nextMeta = {
        ...s.engineMeta,
        [engineKey]: { lastUsed: Date.now() },
      };

      return {
        engineOpts: nextOpts,
        engineMeta: nextMeta,
      };
    });
  },

  // --- gcEngines: xóa engine rảnh lâu (không còn item active) ---
  gcEngines: (olderThanMs) => {
    const now = Date.now();

    set((s) => {
      // helper: xem engineKey có đang có item active không
      const hasActiveFor = (ek: string): boolean => {
        // Nếu UploadItem có trường engineKey, check chi tiết;
        // nếu không có, coi như không khớp (an toàn: không xóa nhầm).
        for (const it of Object.values(s.items)) {
          const isActive = it.status === "queued" || it.status === "uploading";
          const matchEngine =
            (it as unknown as { engineKey?: string }).engineKey === ek;
          if (isActive && matchEngine) return true;
        }
        return false;
      };

      // Duyệt toàn bộ meta, lọc ra engine cần giữ lại
      const keepKeys: string[] = [];
      for (const [ek, meta] of Object.entries(s.engineMeta)) {
        const idleLongEnough =
          !hasActiveFor(ek) &&
          typeof meta.lastUsed === "number" &&
          now - meta.lastUsed > olderThanMs;

        // Giữ lại nếu KHÔNG thỏa điều kiện xóa
        if (!idleLongEnough) {
          keepKeys.push(ek);
        }
      }

      // Rebuild engineOpts/engines/engineMeta chỉ với keys cần giữ
      const nextEngineOpts: UploadState["engineOpts"] = {};
      const nextEngines: UploadState["engines"] = {};
      const nextEngineMeta: UploadState["engineMeta"] = {};
      for (const k of keepKeys) {
        if (s.engineOpts[k]) nextEngineOpts[k] = s.engineOpts[k];
        nextEngines[k] = s.engines[k];
        if (s.engineMeta[k]) nextEngineMeta[k] = s.engineMeta[k];
      }

      return {
        engineOpts: nextEngineOpts,
        engines: nextEngines,
        engineMeta: nextEngineMeta,
      };
    });
  },

  bindEngineAPI: (key, api) => {
    set((s) => ({
      engines: { ...s.engines, [key]: api },
    }));
  },

  upsertBatch: (rows: Omit<UploadItem, "engineKey">[], engineKey: string) => {
    set((s) => {
      const next = { ...s.items };
      for (const r of rows) {
        const prev = next[r.id];
        next[r.id] = { ...prev, ...r, engineKey };
      }
      return { items: next };
    });
  },

  setProgress: (id, percent, uploadedBytes, totalBytes, uploadId) => {
    set((s) => {
      const curr = s.items[id];
      if (!curr) return s;
      const p = clamp(percent, curr.percent, 100);
      if (p === curr.percent && curr.status === "uploading") return s;
      return {
        items: {
          ...s.items,
          [id]: {
            ...curr,
            percent: p,
            status: "uploading",
            uploadedBytes,
            totalBytes,
            uploadId,
          },
        },
      };
    });
  },

  setStatus: (id, status, errorMsg) => {
    set((s) => {
      const curr = s.items[id];
      if (!curr) return s;
      const nextPercent = status === "done" ? 100 : curr.percent;
      const next: UploadItem = {
        ...curr,
        percent: nextPercent,
        status,
        error: errorMsg ?? curr.error,
        completedAt:
          status === "done"
            ? (curr.completedAt ?? Date.now())
            : curr.completedAt,
      };
      return { items: { ...s.items, [id]: next } };
    });
  },

  pruneCompletedForBatch: (batchId) => {
    set((s) => {
      const prefix = `${batchId}:`;
      const next: Record<string, UploadItem> = {};
      for (const [id, it] of Object.entries(s.items)) {
        const sameBatch = (it.uid ?? "").startsWith(prefix);
        const completed = it.status === "done";

        if (!sameBatch || !completed) {
          next[id] = it;
        }
      }
      return { items: next };
    });
  },

  pinBatch: (batchId) => {
    set((s) => {
      const curr = s.pinnedBatches[batchId] ?? 0;
      return { pinnedBatches: { ...s.pinnedBatches, [batchId]: curr + 1 } };
    });
  },

  unpinBatch: (batchId) => {
    set((s) => {
      const curr = s.pinnedBatches[batchId] ?? 0;
      const count = Math.max(0, curr - 1);
      const { [batchId]: _omit, ...rest } = s.pinnedBatches;
      return {
        pinnedBatches:
          count > 0 ? { ...s.pinnedBatches, [batchId]: count } : rest,
      };
    });
  },

  gcCompleted: (olderThanMs) => {
    const now = Date.now();
    set((s) => {
      const next: Record<string, UploadItem> = {};
      for (const [id, it] of Object.entries(s.items)) {
        const isDone = it.status === "done";
        const isCanceled = it.status === "canceled";
        const doneOldEnough =
          isDone &&
          it.completedAt !== undefined &&
          now - it.completedAt > olderThanMs;

        const uid = it.uid ?? "";
        const batchId = uid.includes(":") ? uid.split(":")[0] : undefined;
        const pinned = batchId ? (s.pinnedBatches[batchId] ?? 0) > 0 : false;

        if (pinned || (!(isDone && doneOldEnough) && !isCanceled)) {
          next[id] = it;
        }
      }
      return { items: next };
    });
  },

  remove: (id) => {
    set((s) => {
      const { [id]: _, ...rest } = s.items;
      return { items: rest };
    });
  },

  reset: () => {
    set({ items: {} });
  },

  startOn: async (key, payload) => {
    const opts = get().engineOpts[key];
    if (!opts) throw new Error(`Engine opts not found for key: ${key}`);
    const api = await waitFor<EngineAPI>(() => get().engines[key]);
    await api.start(payload);
  },

  cancelOn: async (key, id) => {
    const api = await waitFor<EngineAPI>(() => get().engines[key]);
    await api.cancel(id);
  },

  retryOn: async (key, id) => {
    const api = await waitFor<EngineAPI>(() => get().engines[key]);
    await api.retry(id);
  },

  cancelAll: async () => {
    const { items, engines } = get();
    const targets = Object.values(items).filter(
      (it) => it.status === "queued" || it.status === "uploading",
    );
    const tasks = targets
      .map((it) => engines[it.engineKey]?.cancel(it.id))
      .filter((p): p is Promise<void> => p !== undefined);
    await Promise.allSettled(tasks);
  },
}));

export function useUploadStore<T>(
  selector: (s: UploadStore) => T,
  equalityFn?: (a: T, b: T) => boolean,
): T {
  return useStoreWithEqualityFn(uploadStore, selector, equalityFn);
}
