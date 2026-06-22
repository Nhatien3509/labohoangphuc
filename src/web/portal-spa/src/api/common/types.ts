import type { ServiceName } from "@common/lib/core/types";

export const PROJECTS_TAG = "projects";
export const PROJECT_REGIONS_TAG = "project_regions";

export const PROJECT_REGION_SERVICES_TAG = "project_region_services_tag";

type Context = {
  requestType?: string;
  service: string;
  planTemplate?: string;
};

export type User = {
  id: string;
  displayName: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  bypassBilling?: boolean;
  maxProjects?: number | null;
  remainingProjects: number | null;
};

export type Region = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  visibility?: "private" | "public";
  description?: string;
};

export type Zone = {
  id: string;
  url: string;
  name: string;
  displayName: string;
  description?: string;
  region: Region;
};

export type QuestionBody = {
  customerName: string;
  phoneNumber?: string | null;
  email: string;
  question?: string;
  context?: Context | null;
  kind: "general" | "service request" | "other" | "subscribe";
};

export type QuestionResponse = {
  id: string;
  user: string;
  customerName: string;
  phoneNumber?: string | null;
  email: string;
  question: string;
  status: "new" | "work-in-progress" | "responded" | "resolved" | null;
  context?: Context | null;
  kind: "general" | "service request" | "other";
  createdAt: Date;
  updatedAt: Date;
};

export type EstimateItem = {
  label: string;
  unit: string | null;
  quantity: string | null;
  granularity: "per-hour" | "per-month" | null;
  originalPrice: string;
  discountAmount: string;
  taxAmount: string;
  adjustedPrice: string;
};

export type CostEstimate = {
  components: EstimateItem[];
  total: EstimateItem;
  hourlyPrice: string;
  monthlyPrice: string;
  reserveAmount: string;
};

export type Organization = {
  id: string;
  name: string;
  displayName: string;
  slug: string;
  description?: string;
  root: string | null;
  logo?: string | null;
  domain?: string | null;
  owner: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const defaultOrg: Organization = {
  id: "",
  name: "",
  displayName: "",
  slug: "",
  root: null,
  logo: null,
  owner: "",
  domain: "",
  description: "",
  verified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export type Project = {
  displayName: string;
  id: string;
  url: string;
  name: string;
  slug: string;
  description?: string;
  enableIam?: boolean;
  directory: string | null;
  path: {
    id: string;
    name: string;
  }[];
  organization: Organization | null;
  label: CommonInfo | null;
  hasBillingPlan?: boolean;
  hasPaygSubscription?: boolean;
};

export type CommonInfo = {
  id: string;
  name: string;
  description?: string;
};

export type ServiceRegion = {
  service: CommonInfo & { title: string };
  region: CommonInfo;
  active: boolean;
};

export type ServiceV2 = {
  id: string;
  name: ServiceName;
  title: string;
  description: string;
  serviceCategoryId: string;
  iconCode: number;
  url: string;
  type: string;
};

export type ProjectService = {
  service: ServiceV2;
  active: boolean;
};

export type MetricsSchema = {
  start: {
    type: string;
    required: boolean;
    readOnly: boolean;
    label: string;
  };
  end: {
    type: string;
    required: boolean;
    readOnly: boolean;
    label: string;
  };
  metric: {
    type: string;
    required: boolean;
    readOnly: boolean;
    label: string;
    choices: {
      value: string;
      displayName: string;
    }[];
  };
};

export type Metrics = {
  name: string;
  data: Array<[number, string]>;
};

export type GlobalErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;
