import { env } from "@/env";

export type FeatureNode = boolean | { [key: string]: FeatureNode };
export type FeatureTree = Record<string, FeatureNode>;

export const config = {
  debugLogs: {
    enabled: env.DEBUG_LOGS_ENABLE,
  },
  themeSwitch: {
    enabled: env.THEME_SWITCH_ENABLE,
  },
  useBasicAuth: {
    enabled: env.USE_BASIC_AUTH_ENABLE,
  },
  monitoring: {
    enabled: env.MONITORING_ENABLE,
  },
  cloudObservability: {
    enabled: env.CLOUD_OBSERVABILITY_ENABLE,
  },
  logs: {
    enabled: env.LOGS_ENABLE,
  },
  pat: {
    enabled: env.PAT_ENABLE,
  },
  vpn: {
    enabled: env.VPN_ENABLE,
  },
  network: {
    shareVPC: env.NETWORK_SHARE_VPC_ENABLE,
    directConnect: env.NETWORK_DIRECT_CONNECT_ENABLE,
    dns: env.NETWORK_DNS_ENABLE,
    loadBalancing: env.NETWORK_LOAD_BALANCING_ENABLE,
  },
  server: {
    liveResize: env.SERVER_LIVE_RESIZE_ENABLE,
  },
  objectStorage: {
    dataSyncJob: env.OBJECT_STORAGE_DATA_SYNC_JOB_ENABLE,
    dataSyncConfig: env.OBJECT_STORAGE_DATA_SYNC_CONFIG_ENABLE,
    encryptType: env.OBJECT_STORAGE_ENCRYPT_TYPE_ENABLE,
  },
  fileStorage: {
    enabled: env.FILE_STORAGE_ENABLE,
  },
  kms: {
    enabled: env.KMS_ENABLE,
  },
  dms: {
    enabled: env.DMS_ENABLE,
  },
  dbaas: {
    enabled: env.DBAAS_ENABLE,
  },
  containerRegistry: {
    enabled: env.CONTAINER_REGISTRY_ENABLE,
  },
} as const satisfies FeatureTree;

type FeatureTreeConfig = typeof config;

type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends boolean
    ? `${Prefix}${Extract<K, string>}`
    : T[K] extends Record<string, unknown>
      ? LeafPaths<T[K], `${Prefix}${Extract<K, string>}.`>
      : never;
}[keyof T];

export type FeatureKey = LeafPaths<FeatureTreeConfig>;
