import { AutoScaling } from "./AutoScaling";
import { BackupService } from "./BackupService";
import { BlockStorage } from "./BlockStorage";
import { CloudObservability } from "./CloudObservability";
import { ContainerRegistry } from "./ContainerRegistry";
import { DBaaS } from "./DBaaS";
import { DedicatedCloud } from "./DedicatedCloud";
import { FileStorage } from "./FileStorage";
import { KeyManagement } from "./KeyManagement";
import { Kubernetes } from "./Kubernetes";
import { LoadBalancing } from "./LoadBalancing";
import { Network } from "./Network";
import { ObjectStorage } from "./ObjectStorage";
import { SERVICE_NAMES } from "@common/lib/core/const";
import { Server } from "./Server";
import type { ServiceIconMapType } from "@common/components/icons/types";
import { VirtualPrivateNetwork } from "./VirtualPrivateNetwork";
import { VolumeBasedDDoSPrevention } from "./VolumeBasedDDoSPrevention";
import { WebProtection } from "./WebProtection";

// Icon for mapping Service
export const ServiceIconsMap: ServiceIconMapType[] = [
  {
    name: SERVICE_NAMES.SERVER,
    iconCode: 1,
    icon: <Server className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.AUTO_SCALING,
    iconCode: 2,
    icon: <AutoScaling className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.KUBERNETES,
    iconCode: 3,
    icon: <Kubernetes size={48} className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.DPC,
    iconCode: 4,
    icon: <DedicatedCloud className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.NETWORK,
    iconCode: 11,
    icon: <Network className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.LOAD_BALANCING,
    iconCode: 12,
    icon: <LoadBalancing className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.VPN,
    iconCode: 13,
    icon: <VirtualPrivateNetwork className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.CLOUD_OBSERVABILITY,
    iconCode: 18,
    icon: <CloudObservability className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.BLOCK_STORAGE,
    iconCode: 21,
    icon: <BlockStorage className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.OBJECT_STORAGE,
    iconCode: 22,
    icon: <ObjectStorage className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.FILE_STORAGE,
    iconCode: 23,
    icon: <FileStorage className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.BACKUP,
    iconCode: 24,
    icon: <BackupService className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.CONTAINER_REGISTRY,
    iconCode: 31,
    icon: <ContainerRegistry className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.DBAAS,
    iconCode: 32,
    icon: <DBaaS className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.WEB_PROTECTION,
    iconCode: 41,
    icon: <WebProtection className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.VOLUME_BASED_DDOS_PREVENTION,
    iconCode: 42,
    icon: <VolumeBasedDDoSPrevention className="text-neutral-700" />,
  },
  {
    name: SERVICE_NAMES.KMS,
    iconCode: 43,
    icon: <KeyManagement className="text-neutral-700" />,
  },
];
