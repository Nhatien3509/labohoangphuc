import { describe, expect, test } from "vitest";
import { ROUTES } from "@common/lib/core/routes";

describe("ROUTES additional services", () => {
  test("billing routes", () => {
    expect(ROUTES.billing.home).toBe("/billing");
    expect(ROUTES.billing.account).toBe("/billing/account");
    expect(ROUTES.billing.transactions).toBe("/billing/transactions");
    expect(ROUTES.billing.costReports).toBe("/billing/cost-reports");
    expect(ROUTES.billing.costAnalysis).toBe("/billing/cost-analysis");
  });

  test("iam routes", () => {
    expect(ROUTES.iam.home).toBe("/iam");
    expect(ROUTES.iam.root).toBe("/iam/root");
    expect(ROUTES.iam.rootOverview).toBe("/iam/root/overview");
    expect(ROUTES.iam.rootMembers).toBe("/iam/root/members");
    expect(ROUTES.iam.rootPredefinedRoleDetails("role-1")).toBe(
      "/iam/root/roles/predefined/role-1/details",
    );
    expect(ROUTES.iam.rootCustomRoleDetails("role-1")).toBe(
      "/iam/root/roles/custom/role-1/details",
    );
    expect(ROUTES.iam.rootCustomRolesCreate).toBe(
      "/iam/root/roles/custom/create",
    );
    expect(ROUTES.iam.rootCustomRoleEdit("role-1")).toBe(
      "/iam/root/roles/custom/role-1/edit",
    );
    expect(ROUTES.iam.directoryRoles("dir-1")).toBe("/iam/dir-1/roles");
    expect(ROUTES.iam.directoryPredefinedRoles("dir-1")).toBe(
      "/iam/dir-1/roles/predefined",
    );
    expect(ROUTES.iam.directoryCustomRoles("dir-1")).toBe(
      "/iam/dir-1/roles/custom",
    );
    expect(ROUTES.iam.directoryOverview("dir-1")).toBe("/iam/dir-1/overview");
    expect(ROUTES.iam.directoryGroups("dir-1")).toBe("/iam/dir-1/groups");
    expect(ROUTES.iam.directoryGroupCreate("dir-1")).toBe(
      "/iam/dir-1/groups/create",
    );
    expect(ROUTES.iam.directoryGroupDetails("dir-1", "group-1")).toBe(
      "/iam/dir-1/groups/group-1/details",
    );
    expect(ROUTES.iam.directoryGroupEdit("dir-1", "group-1")).toBe(
      "/iam/dir-1/groups/group-1/edit",
    );
  });

  test("marketplace routes", () => {
    expect(ROUTES.marketplace.home).toBe("/marketplace");
    expect(ROUTES.marketplace.subscriptions).toBe("/marketplace/subscriptions");
    expect(ROUTES.marketplace.subscriptionEdit("sub-1")).toBe(
      "/marketplace/subscriptions/sub-1/edit",
    );
    expect(ROUTES.marketplace.productDetails("p-1")).toBe(
      "/marketplace/p-1/details",
    );
    expect(ROUTES.marketplace.checkout("p-1", "plan-1")).toBe(
      "/marketplace/p-1/checkout?planId=plan-1",
    );
  });

  test("devops sphere routes", () => {
    expect(ROUTES.devopsSphere.home).toBe("/devops-sphere");
    expect(ROUTES.devopsSphere.repos).toBe("/devops-sphere/repos");
    expect(ROUTES.devopsSphere.reposCreate).toBe("/devops-sphere/repos/create");
    expect(ROUTES.devopsSphere.devspaces).toBe("/devops-sphere/devspaces");
    expect(ROUTES.devopsSphere.devspacesCreate).toBe(
      "/devops-sphere/devspaces/create",
    );
  });
});

describe("ROUTES.backup", () => {
  test("home route", () => {
    expect(ROUTES.backup.home).toBe("/backup");
  });

  test("create route", () => {
    expect(ROUTES.backup.create).toBe("/backup/create");
  });

  test("management route", () => {
    expect(ROUTES.backup.management).toBe("/backup/management");
  });

  test("backup details route", () => {
    expect(ROUTES.backup.backupDetails("123")).toBe(
      "/backup/management/123/details",
    );
  });

  test("policies route", () => {
    expect(ROUTES.backup.policies).toBe("/backup/policies");
  });

  test("policy create route", () => {
    expect(ROUTES.backup.policyCreate).toBe("/backup/policies/create");
  });

  test("policy details route", () => {
    expect(ROUTES.backup.policyDetails("abc")).toBe(
      "/backup/policies/abc/details",
    );
  });

  test("policy edit route", () => {
    expect(ROUTES.backup.policyEdit("abc")).toBe("/backup/policies/abc/edit");
  });

  test("policy apply route", () => {
    expect(ROUTES.backup.policyApply("abc")).toBe("/backup/policies/abc/apply");
  });
});

describe("ROUTES dashboard services", () => {
  test("cloud server routes", () => {
    expect(ROUTES.cloudServer.home).toBe("/cloud-server");
    expect(ROUTES.cloudServer.management).toBe("/cloud-server/management");
    expect(ROUTES.cloudServer.create).toBe("/cloud-server/create");
  });

  test("network routes", () => {
    expect(ROUTES.network.home).toBe("/network");
    expect(ROUTES.network.vpcs).toBe("/network/vpcs");
    expect(ROUTES.network.vpcCreate).toBe("/network/vpcs/create");
    expect(ROUTES.network.elasticIpAllocate).toBe(
      "/network/elastic-ips/allocate",
    );
    expect(ROUTES.network.directConnects).toBe("/network/direct-connects");
    expect(ROUTES.network.directConnectCreate).toBe(
      "/network/direct-connects/create",
    );
    expect(ROUTES.network.securityGroups).toBe("/network/security-groups");
    expect(ROUTES.network.routeTables).toBe("/network/route-tables");
    expect(ROUTES.network.vpcPeering).toBe("/network/vpc-peering");
    expect(ROUTES.network.dns).toBe("/network/dns");
    expect(ROUTES.network.dnsCreate).toBe("/network/dns/create");
    expect(ROUTES.network.dnsRRSetCreate("dns-1")).toBe(
      "/network/dns/dns-1/rrsets/create",
    );
  });

  test("storage routes", () => {
    expect(ROUTES.blockStorage.home).toBe("/block-storage");
    expect(ROUTES.blockStorage.volumes).toBe("/block-storage/volumes");
    expect(ROUTES.blockStorage.volumeCreateEmpty).toBe(
      "/block-storage/volumes/create/empty",
    );
    expect(ROUTES.fileStorage.home).toBe("/file-storage");
    expect(ROUTES.fileStorage.filesystem).toBe("/file-storage/filesystem");
    expect(ROUTES.fileStorage.filesystemCreate("snapshot")).toBe(
      "/file-storage/filesystem/create/snapshot",
    );
    expect(ROUTES.fileStorage.filesystemCreateEmpty).toBe(
      "/file-storage/filesystem/create/empty",
    );
    expect(ROUTES.fileStorage.filesystemCreateSnapshot).toBe(
      "/file-storage/filesystem/create/snapshot",
    );
    expect(ROUTES.fileStorage.snapshots).toBe("/file-storage/snapshot");
    expect(ROUTES.fileStorage.policies).toBe("/file-storage/policy");
    expect(ROUTES.fileStorage.policyCreate).toBe("/file-storage/policy/create");
    expect(ROUTES.objectStorage.home).toBe("/object-storage");
    expect(ROUTES.objectStorage.buckets).toBe("/object-storage/buckets");
    expect(ROUTES.objectStorage.bucketCreate).toBe(
      "/object-storage/buckets/create",
    );
    expect(ROUTES.objectStorage.keyGroups).toBe("/object-storage/key-groups");
    expect(ROUTES.objectStorage.dataSyncJobs).toBe(
      "/object-storage/data-sync-jobs",
    );
    expect(ROUTES.objectStorage.dataSyncJobsCreate).toBe(
      "/object-storage/data-sync-jobs/create",
    );
    expect(ROUTES.objectStorage.dataSyncConfigs).toBe(
      "/object-storage/data-sync-configs",
    );
    expect(ROUTES.objectStorage.dataSyncConfigsCreate).toBe(
      "/object-storage/data-sync-configs/create",
    );
  });

  test("compute and platform routes", () => {
    expect(ROUTES.kubernetes.home).toBe("/kubernetes");
    expect(ROUTES.kubernetes.clusters).toBe("/kubernetes/clusters");
    expect(ROUTES.kubernetes.clusterCreate).toBe("/kubernetes/clusters/create");
    expect(ROUTES.kubernetes.clusterEdit("cluster-1")).toBe(
      "/kubernetes/clusters/cluster-1/edit",
    );
    expect(ROUTES.kubernetes.clusterDetailsTab("cluster-1", "node_pool")).toBe(
      "/kubernetes/clusters/cluster-1/details?tab=node_pool",
    );
    expect(ROUTES.kubernetes.backupRestore.backupPlan).toBe(
      "/kubernetes/backup-restore/backup-plan",
    );
    expect(ROUTES.kubernetes.backupRestore.backupPlanCreate).toBe(
      "/kubernetes/backup-restore/backup-plan/create",
    );
    expect(ROUTES.kubernetes.backupRestore.backupPlanEdit("plan-1")).toBe(
      "/kubernetes/backup-restore/backup-plan/plan-1/edit",
    );
    expect(ROUTES.kubernetes.backupRestore.storage).toBe(
      "/kubernetes/backup-restore/storage",
    );
    expect(ROUTES.kubernetes.backupRestore.restore).toBe(
      "/kubernetes/backup-restore/restore",
    );
    expect(ROUTES.kubernetes.backupRestore.restoreCreate).toBe(
      "/kubernetes/backup-restore/restore/create",
    );
    expect(ROUTES.loadBalancing.home).toBe("/load-balancing");
    expect(ROUTES.loadBalancing.loadBalancers).toBe(
      "/load-balancing/load-balancers",
    );
    expect(ROUTES.loadBalancing.loadBalancersCreate).toBe(
      "/load-balancing/load-balancers/create",
    );
    expect(ROUTES.loadBalancing.loadBalancerListenerCreate("lb-1")).toBe(
      "/load-balancing/load-balancers/lb-1/listeners/create",
    );
    expect(ROUTES.loadBalancing.loadBalancerServerGroupCreate("lb-1")).toBe(
      "/load-balancing/load-balancers/lb-1/server-groups/create",
    );
  });

  test("observability, vpn, dms, dbaas and kms routes", () => {
    expect(ROUTES.cloudObservability.home).toBe("/cloud-observability");
    expect(ROUTES.cloudObservability.tokens).toBe(
      "/cloud-observability/tokens",
    );
    expect(ROUTES.cloudObservability.metricRuleGroups).toBe(
      "/cloud-observability/metric-rule-groups",
    );
    expect(ROUTES.cloudObservability.metricRules).toBe(
      "/cloud-observability/metric-rules",
    );
    expect(ROUTES.cloudObservability.metricRuleEdit("rule-1")).toBe(
      "/cloud-observability/metric-rules/rule-1/edit",
    );
    expect(ROUTES.cloudObservability.metricRuleClone("rule-1")).toBe(
      "/cloud-observability/metric-rules/rule-1/clone",
    );
    expect(ROUTES.cloudObservability.metricRuleGroupDetails("group-1")).toBe(
      "/cloud-observability/metric-rule-groups/group-1/details",
    );
    expect(ROUTES.cloudObservability.metricRuleGroupCreate("group-1")).toBe(
      "/cloud-observability/metric-rule-groups/group-1/create",
    );
    expect(ROUTES.cloudObservability.logRules).toBe(
      "/cloud-observability/log-rules",
    );
    expect(ROUTES.cloudObservability.logStores).toBe(
      "/cloud-observability/log-stores",
    );
    expect(ROUTES.cloudObservability.logStoresActivateFeature).toBe(
      "/cloud-observability/log-stores/activate-logs-feature",
    );
    expect(ROUTES.cloudObservability.logStoreEdit("log-1")).toBe(
      "/cloud-observability/log-stores/log-1/edit",
    );
    expect(ROUTES.cloudObservability.dashboardTemplates).toBe(
      "/cloud-observability/dashboard-templates",
    );
    expect(ROUTES.cloudObservability.receivers).toBe(
      "/cloud-observability/receivers",
    );
    expect(ROUTES.cloudObservability.incidents).toBe(
      "/cloud-observability/incidents",
    );
    expect(ROUTES.vpn.home).toBe("/vpn");
    expect(ROUTES.vpn.strongwan).toBe("/vpn/vpn-connections/strongwan");
    expect(ROUTES.vpn.strongwanCreate).toBe(
      "/vpn/vpn-connections/strongwan/create",
    );
    expect(ROUTES.vpn.wireguard).toBe("/vpn/vpn-connections/wireguard");
    expect(ROUTES.vpn.wireguardCreate).toBe(
      "/vpn/vpn-connections/wireguard/create",
    );
    expect(ROUTES.vpn.vpnGateways).toBe("/vpn/vpn-gateways");
    expect(ROUTES.vpn.vpnGatewaysCreate).toBe("/vpn/vpn-gateways/create");
    expect(ROUTES.vpn.ikePolicies).toBe("/vpn/ike-policies");
    expect(ROUTES.vpn.ikePoliciesCreate).toBe("/vpn/ike-policies/create");
    expect(ROUTES.vpn.ipsecPolicies).toBe("/vpn/ipsec-policies");
    expect(ROUTES.vpn.ipsecPoliciesCreate).toBe("/vpn/ipsec-policies/create");
    expect(ROUTES.vpn.vpnServers).toBe("/vpn/vpn-servers");
    expect(ROUTES.vpn.vpnServersCreate).toBe("/vpn/vpn-servers/create");
    expect(ROUTES.dms.home).toBe("/dms");
    expect(ROUTES.dms.endpoints).toBe("/dms/endpoints");
    expect(ROUTES.dms.endpointsCreate).toBe("/dms/endpoints/create");
    expect(ROUTES.dms.migrationTasks).toBe("/dms/migration-tasks");
    expect(ROUTES.dms.migrationTasksCreate).toBe("/dms/migration-tasks/create");
    expect(ROUTES.dms.replicationInstances).toBe("/dms/replication-instances");
    expect(ROUTES.dms.replicationInstanceCreate).toBe(
      "/dms/replication-instances/create",
    );
    expect(ROUTES.dbaas.home).toBe("/dbaas");
    expect(ROUTES.dbaas.instances).toBe("/dbaas/instances");
    expect(ROUTES.dbaas.instanceCreate).toBe("/dbaas/instances/create");
    expect(ROUTES.dbaas.instanceDetails("db-1")).toBe(
      "/dbaas/instances/db-1/details",
    );
    expect(ROUTES.dbaas.backups).toBe("/dbaas/backups");
    expect(ROUTES.dbaas.instanceOverview("db-1")).toBe(
      "/dbaas/instances/db-1/overview",
    );
    expect(ROUTES.dbaas.backupEdit("backup-1")).toBe(
      "/dbaas/backups/backup-1/edit",
    );
    expect(ROUTES.kms.home).toBe("/kms");
    expect(ROUTES.kms.key).toBe("/kms/key");
    expect(ROUTES.kms.keyCreate).toBe("/kms/key/create");
    expect(ROUTES.kms.secret).toBe("/kms/secret");
    expect(ROUTES.kms.secretCreate).toBe("/kms/secret/create");
    expect(ROUTES.kms.secretEdit("sec-1")).toBe("/kms/secret/sec-1/edit");
    expect(ROUTES.kms.sslCertificate).toBe("/kms/ssl-certificate");
    expect(ROUTES.kms.sslCertificateCreate).toBe("/kms/ssl-certificate/create");
  });
});

describe("ROUTES.project", () => {
  test("project base route", () => {
    expect(ROUTES.project.home).toBe("/project");
  });

  test("project detail routes", () => {
    expect(ROUTES.project.billing("prj-1")).toBe("/project/prj-1/billing");
    expect(ROUTES.project.overview("prj-1")).toBe("/project/prj-1/overview");
    expect(ROUTES.project.quotas("prj-1")).toBe("/project/prj-1/quotas");
    expect(ROUTES.project.members("prj-1")).toBe("/project/prj-1/members");
    expect(ROUTES.project.memberEdit("prj-1", "mem-1")).toBe(
      "/project/prj-1/members/mem-1/edit",
    );
    expect(ROUTES.project.rolesCreate("prj-1")).toBe(
      "/project/prj-1/roles/create",
    );
    expect(ROUTES.project.roles("prj-1")).toBe("/project/prj-1/roles");
    expect(ROUTES.project.roleEdit("prj-1", "role-1")).toBe(
      "/project/prj-1/roles/role-1/edit",
    );
    expect(ROUTES.project.regions("prj-1")).toBe("/project/prj-1/regions");
    expect(ROUTES.project.billingTransactions("prj-1")).toBe(
      "/project/prj-1/billing/transactions",
    );
    expect(ROUTES.project.billingCostReports("prj-1")).toBe(
      "/project/prj-1/billing/cost-reports",
    );
  });
});
