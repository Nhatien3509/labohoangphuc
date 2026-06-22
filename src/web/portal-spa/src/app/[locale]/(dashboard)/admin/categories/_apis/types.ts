export type CategoryStatus = "active" | "inactive";

export type CategoryAddress = {
  type: "IP" | "Domain";
  value: string;
};

export type CategoryRow = {
  id: number;
  name: string;
  softwareCode: string;
  softwareType?: string;
  addresses: CategoryAddress[];
  status: CategoryStatus;
  createdAt: string;
};

export type ConnectedSystemEndpoint = {
  id: number;
  name: string;
  protocol?: "http" | "https";
  baseUrl: string;
  status: string;
  priority: number;
  port?: number;
  type: "ip" | "domain";
  method?: "GET" | "POST" | "PUT" | "DELETE";
  connectedSystemId: number;
};

export type ConnectedSystem = {
  id: number;
  name: string;
  softwareCode: string;
  shortName?: string;
  softwareType?: string;
  description: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  status: "ACTIVE" | "INACTIVE";
  endpoints?: ConnectedSystemEndpoint[];
  createdAt: string;
  updatedAt: string;
};

export type ConnectedSystemSearchResponse = {
  items?: ConnectedSystem[];
  totalCount?: number;
};

export type CheckCodeDuplicateResponse = {
  code: string;
  existed: boolean;
  excludeId?: number;
};

export type CategoryListParams = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  softwareType: string;
  fromDate: string;
  toDate: string;
};

export type CategoryListResult = {
  items: CategoryRow[];
  total: number;
};

export type CreateEndpointPayload = {
  baseUrl: string;
  type: "ip" | "domain";
  port?: number;
  protocol: "http" | "https";
  priority?: number;
  method: "GET" | "POST" | "PUT" | "DELETE";
};

export type CreateConnectedSystemPayload = {
  name: string;
  softwareCode?: string;
  shortName?: string;
  softwareType?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  endpoints: CreateEndpointPayload[];
};

export type UpdateEndpointPayload = CreateEndpointPayload & {
  id?: number;
};

export type UpdateConnectedSystemPayload = {
  name: string;
  softwareCode?: string;
  shortName?: string;
  softwareType?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  endpoints: UpdateEndpointPayload[];
};
