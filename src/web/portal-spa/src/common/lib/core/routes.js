/**
 * @param {string} path
 * @returns {`/:locale${string}`}
 */
export const withLocale = (path) => `/:locale${path}`;

export const ROUTES = /** @type {const} */ {
  dashboard: {
    home: "/",
  },

  billing: {
    home: "/billing",
    account: "/billing/account",
    accountDeposit: "/billing/account/deposit",
    transactions: "/billing/transactions",
    costReports: "/billing/cost-reports",
    /**
     * @param {string} billId
     * @returns {`/billing/cost-reports/${string}/details`}
     */
    costReportDetails: (billId) => `/billing/cost-reports/${billId}/details`,
    costAnalysis: "/billing/cost-analysis",
  },

  iam: {
    home: "/iam",
    root: "/iam/root",
    rootOverview: "/iam/root/overview",
    rootStructure: "/iam/root/structure",
    rootMembers: "/iam/root/members",
    rootGroups: "/iam/root/groups",
    /**
     * @param {string} groupId
     * @returns {`/iam/root/groups/${string}/details`}
     */
    rootGroupDetails: (groupId) => `/iam/root/groups/${groupId}/details`,
    rootRoles: "/iam/root/roles",
    rootPredefinedRoles: "/iam/root/roles/predefined",
    /**
     * @param {string} roleId
     * @returns {`/iam/root/roles/predefined/${string}/details`}
     */
    rootPredefinedRoleDetails: (roleId) =>
      `/iam/root/roles/predefined/${roleId}/details`,
    rootCustomRoles: "/iam/root/roles/custom",
    /**
     * @param {string} roleId
     * @returns {`/iam/root/roles/custom/${string}/details`}
     */
    rootCustomRoleDetails: (roleId) =>
      `/iam/root/roles/custom/${roleId}/details`,
    rootCustomRolesCreate: "/iam/root/roles/custom/create",
    /**
     * @param {string} roleId
     * @returns {`/iam/root/roles/custom/${string}/edit`}
     */
    rootCustomRoleEdit: (roleId) => `/iam/root/roles/custom/${roleId}/edit`,
    rootInviteMembers: "/iam/root/members/invite",
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/roles`}
     */
    directoryRoles: (directoryId) => `/iam/${directoryId}/roles`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/roles/predefined`}
     */
    directoryPredefinedRoles: (directoryId) =>
      `/iam/${directoryId}/roles/predefined`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/roles/custom`}
     */
    directoryCustomRoles: (directoryId) => `/iam/${directoryId}/roles/custom`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/overview`}
     */
    directoryOverview: (directoryId) => `/iam/${directoryId}/overview`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/structure`}
     */
    directoryStructure: (directoryId) => `/iam/${directoryId}/structure`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/members`}
     */
    directoryMembers: (directoryId) => `/iam/${directoryId}/members`,
    /**
     * @param {string} directoryId
     * @param {string} memberId
     * @returns {`/iam/${string}/members/${string}/invite`}
     */
    directoryMembersInvite: (directoryId, memberId) =>
      `/iam/${directoryId}/members/${memberId}/invite`,
    /**
     * @param {string} directoryId
     * @param {string} memberId
     * @returns {`/iam/${string}/members/${string}/details`}
     */
    directoryMemberDetails: (directoryId, memberId) =>
      `/iam/${directoryId}/members/${memberId}/details`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/groups`}
     */
    directoryGroups: (directoryId) => `/iam/${directoryId}/groups`,
    /**
     * @param {string} directoryId
     * @returns {`/iam/${string}/groups/create`}
     */
    directoryGroupCreate: (directoryId) => `/iam/${directoryId}/groups/create`,
    /**
     * @param {string} directoryId
     * @param {string} groupId
     * @returns {`/iam/${string}/groups/${string}/details`}
     */
    directoryGroupDetails: (directoryId, groupId) =>
      `/iam/${directoryId}/groups/${groupId}/details`,
    /**
     * @param {string} directoryId
     * @param {string} groupId
     * @returns {`/iam/${string}/groups/${string}/edit`}
     */
    directoryGroupEdit: (directoryId, groupId) =>
      `/iam/${directoryId}/groups/${groupId}/edit`,
    /**
     * @param {string} directoryId
     * @param {string} roleId
     * @returns {`/iam/${string}/roles/predefined/${string}/details`}
     */
    directoryPredefinedRoleDetails: (directoryId, roleId) =>
      `/iam/${directoryId}/roles/predefined/${roleId}/details`,
    /**
     * @param {string} directoryId
     * @param {string} roleId
     * @returns {`/iam/${string}/roles/custom/${string}/details`}
     */
    directoryCustomRoleDetails: (directoryId, roleId) =>
      `/iam/${directoryId}/roles/custom/${roleId}/details`,
  },

  marketplace: {
    home: "/marketplace",
    subscriptions: "/marketplace/subscriptions",
    /**
     * @param {string} subscriptionId
     * @returns {`/marketplace/subscriptions/${string}/edit`}
     */
    subscriptionEdit: (subscriptionId) =>
      `/marketplace/subscriptions/${subscriptionId}/edit`,
    /**
     * @param {string} productId
     * @returns {`/marketplace/${string}/details`}
     */
    productDetails: (productId) => `/marketplace/${productId}/details`,
    /**
     * @param {string} productId
     * @param {string} planId
     * @returns {`/marketplace/${string}/checkout?planId=${string}`}
     */
    checkout: (productId, planId) =>
      `/marketplace/${productId}/checkout?planId=${planId}`,
  },

  devopsSphere: {
    home: "/devops-sphere",
    repos: "/devops-sphere/repos",
    reposCreate: "/devops-sphere/repos/create",
    /**
     * @param {string} repoId
     * @returns {`/devops-sphere/repos/${string}/details`}
     */
    repoDetails: (repoId) => `/devops-sphere/repos/${repoId}/details`,
    devspaces: "/devops-sphere/devspaces",
    devspacesCreate: "/devops-sphere/devspaces/create",
    /**
     * @param {string} devspaceId
     * @returns {`/devops-sphere/devspaces/${string}/details`}
     */
    devspaceDetails: (devspaceId) =>
      `/devops-sphere/devspaces/${devspaceId}/details`,
  },

  backup: {
    home: "/backup",
    create: "/backup/create",
    management: "/backup/management",
    /**
     * @param {string} backupId
     * @returns {`/backup/management/${string}/details`}
     */
    backupDetails: (backupId) => `/backup/management/${backupId}/details`,
    policies: "/backup/policies",
    policyCreate: "/backup/policies/create",
    /**
     * @param {string} policyId
     * @returns {`/backup/policies/${string}/details`}
     */
    policyDetails: (policyId) => `/backup/policies/${policyId}/details`,
    /**
     * @param {string} policyId
     * @returns {`/backup/policies/${string}/edit`}
     */
    policyEdit: (policyId) => `/backup/policies/${policyId}/edit`,
    /**
     * @param {string} policyId
     * @returns {`/backup/policies/${string}/apply`}
     */
    policyApply: (policyId) => `/backup/policies/${policyId}/apply`,
  },

  cloudServer: {
    home: "/cloud-server",
    create: "/cloud-server/create",
    createFromTemplates: "/cloud-server/create/from-templates",
    management: "/cloud-server/management",
    /**
     * @param {string} serverId
     * @returns {`/cloud-server/management/${string}/details`}
     */
    serverDetails: (serverId) => `/cloud-server/management/${serverId}/details`,
    placementGroups: "/cloud-server/placement-groups",
    /**
     * @param {string} placementGroupId
     * @returns {`/cloud-server/placement-groups/${string}/details`}
     */
    placementGroupDetails: (placementGroupId) =>
      `/cloud-server/placement-groups/${placementGroupId}/details`,
    keyPairs: "/cloud-server/key-pairs",
    /**
     * @param {string} keyPairId
     * @returns {`/cloud-server/key-pairs/${string}/details`}
     */
    keyPairDetails: (keyPairId) =>
      `/cloud-server/key-pairs/${keyPairId}/details`,
    launchTemplates: "/cloud-server/launch-templates",
    launchTemplatesCreate: "/cloud-server/launch-templates/create",
    /**
     * @param {string} launchTemplateId
     * @returns {`/cloud-server/launch-templates/${string}/details`}
     */
    launchTemplateDetails: (launchTemplateId) =>
      `/cloud-server/launch-templates/${launchTemplateId}/details`,
    bareMetals: "/cloud-server/bare-metals",
    /**
     * @param {string} bareMetalId
     * @returns {`/cloud-server/bare-metals/${string}/details`}
     */
    bareMetalDetails: (bareMetalId) =>
      `/cloud-server/bare-metals/${bareMetalId}/details`,
  },

  network: {
    home: "/network",
    vpcs: "/network/vpcs",
    vpcCreate: "/network/vpcs/create",
    /**
     * @param {string} vpcId
     * @returns {`/network/vpcs/${string}/details`}
     */
    vpcDetails: (vpcId) => `/network/vpcs/${vpcId}/details`,
    subnets: "/network/subnets",
    /**
     * @param {string} subnetId
     * @returns {`/network/subnets/${string}/details`}
     */
    subnetDetails: (subnetId) => `/network/subnets/${subnetId}/details`,
    directConnects: "/network/direct-connects",
    directConnectCreate: "/network/direct-connects/create",
    securityGroups: "/network/security-groups",
    routeTables: "/network/route-tables",
    vpcPeering: "/network/vpc-peering",
    dns: "/network/dns",
    dnsCreate: "/network/dns/create",
    /**
     * @param {string} directConnectId
     * @returns {`/network/direct-connects/${string}/details`}
     */
    directConnectDetails: (directConnectId) =>
      `/network/direct-connects/${directConnectId}/details`,
    /**
     * @param {string} securityGroupId
     * @returns {`/network/security-groups/${string}/details`}
     */
    securityGroupDetails: (securityGroupId) =>
      `/network/security-groups/${securityGroupId}/details`,
    /**
     * @param {string} routeTableId
     * @returns {`/network/route-tables/${string}/details`}
     */
    routeTableDetails: (routeTableId) =>
      `/network/route-tables/${routeTableId}/details`,
    /**
     * @param {string} vpcPeeringId
     * @returns {`/network/vpc-peering/${string}/details`}
     */
    vpcPeeringDetails: (vpcPeeringId) =>
      `/network/vpc-peering/${vpcPeeringId}/details`,
    /**
     * @param {string} dnsId
     * @returns {`/network/dns/${string}/details`}
     */
    dnsDetails: (dnsId) => `/network/dns/${dnsId}/details`,
    elasticIps: "/network/elastic-ips",
    elasticIpAllocate: "/network/elastic-ips/allocate",
    /**
     * @param {string} dnsId
     * @returns {`/network/dns/${string}/rrsets/create`}
     */
    dnsRRSetCreate: (dnsId) => `/network/dns/${dnsId}/rrsets/create`,
    /**
     * @param {string} dnsId
     * @returns {`/network/dns/${string}/details?tab=rrsets`}
     */
    dnsDetailsRRSetsTab: (dnsId) => `/network/dns/${dnsId}/details?tab=rrsets`,
    /**
     * @param {string} subnetId
     * @returns {`/network/subnets/${string}/details?defaultTab=1`}
     */
    subnetDetailsPrivateIPsTab: (subnetId) =>
      `/network/subnets/${subnetId}/details?defaultTab=1`,
  },

  blockStorage: {
    home: "/block-storage",
    volumes: "/block-storage/volumes",
    volumesCreate: "/block-storage/volumes/create",
    /**
     * @param {string} sourceType
     * @returns {`/block-storage/volumes/create/${string}`}
     */
    volumeCreate: (sourceType) => `/block-storage/volumes/create/${sourceType}`,
    volumeCreateSnapshot: "/block-storage/volumes/create/snapshot",
    volumeCreateEmpty: "/block-storage/volumes/create/empty",
    /**
     * @param {string} volumeId
     * @returns {`/block-storage/volumes/${string}/details`}
     */
    volumeDetails: (volumeId) => `/block-storage/volumes/${volumeId}/details`,
    snapshots: "/block-storage/snapshots",
    /**
     * @param {string} snapshotId
     * @returns {`/block-storage/snapshots/${string}/details`}
     */
    snapshotDetails: (snapshotId) =>
      `/block-storage/snapshots/${snapshotId}/details`,
    policies: "/block-storage/policies",
    policiesCreate: "/block-storage/policies/create",
    /**
     * @param {string} policyId
     * @returns {`/block-storage/policies/${string}/details`}
     */
    policyDetails: (policyId) => `/block-storage/policies/${policyId}/details`,
    /**
     * @param {string} policyId
     * @returns {`/block-storage/policies/${string}/edit`}
     */
    policyEdit: (policyId) => `/block-storage/policies/${policyId}/edit`,
    /**
     * @param {string} policyId
     * @returns {`/block-storage/policies/${string}/apply`}
     */
    policyApply: (policyId) => `/block-storage/policies/${policyId}/apply`,
    backups: "/block-storage/backups",
  },

  objectStorage: {
    home: "/object-storage",
    buckets: "/object-storage/buckets",
    bucketCreate: "/object-storage/buckets/create",
    /**
     * @param {string} bucketId
     * @returns {`/object-storage/buckets/${string}/details`}
     */
    bucketDetails: (bucketId) => `/object-storage/buckets/${bucketId}/details`,
    keyGroups: "/object-storage/key-groups",
    /**
     * @param {string} keyGroupId
     * @returns {`/object-storage/key-groups/${string}/details`}
     */
    keyGroupDetails: (keyGroupId) =>
      `/object-storage/key-groups/${keyGroupId}/details`,
    dataSyncJobs: "/object-storage/data-sync-jobs",
    dataSyncJobsCreate: "/object-storage/data-sync-jobs/create",
    /**
     * @param {string} syncJobId
     * @returns {`/object-storage/data-sync-jobs/${string}/details`}
     */
    dataSyncJobDetails: (syncJobId) =>
      `/object-storage/data-sync-jobs/${syncJobId}/details`,
    dataSyncConfigs: "/object-storage/data-sync-configs",
    dataSyncConfigsCreate: "/object-storage/data-sync-configs/create",
    /**
     * @param {string} configId
     * @returns {`/object-storage/data-sync-configs/${string}/details`}
     */
    dataSyncConfigDetails: (configId) =>
      `/object-storage/data-sync-configs/${configId}/details`,
  },

  loadBalancing: {
    home: "/load-balancing",
    loadBalancers: "/load-balancing/load-balancers",
    loadBalancersCreate: "/load-balancing/load-balancers/create",
    /**
     * @param {string} lbId
     * @returns {`/load-balancing/load-balancers/${string}/listeners`}
     */
    loadBalancerListener: (lbId) =>
      `/load-balancing/load-balancers/${lbId}/listeners`,
    /**
     * @param {string} lbId
     * @returns {`/load-balancing/load-balancers/${string}/details`}
     */
    loadBalancerDetails: (lbId) =>
      `/load-balancing/load-balancers/${lbId}/details`,
    /**
     * @param {string} lbId
     * @param {string} tab
     * @returns {`/load-balancing/load-balancers/${string}/details?tab=${string}`}
     */
    loadBalancerDetailsTab: (lbId, tab) =>
      `/load-balancing/load-balancers/${lbId}/details?tab=${tab}`,
    /**
     * @param {string} lbId
     * @returns {`/load-balancing/load-balancers/${string}/listeners/create`}
     */
    loadBalancerListenerCreate: (lbId) =>
      `/load-balancing/load-balancers/${lbId}/listeners/create`,

    /**
     * @param {string} lbId
     * @param {string} listenerId
     * @returns {`/load-balancing/load-balancers/${string}/listeners/${string}/edit`}
     */
    loadBalancerListenerEdit: (lbId, listenerId) =>
      `/load-balancing/load-balancers/${lbId}/listeners/${listenerId}/edit`,
    /**
     * @param {string} lbId
     * @param {string} listenerId
     * @returns {`/load-balancing/load-balancers/${string}/listeners/${string}/details`}
     */
    loadBalancerListenerDetails: (lbId, listenerId) =>
      `/load-balancing/load-balancers/${lbId}/listeners/${listenerId}/details`,
    /**
     * @param {string} lbId
     * @returns {`/load-balancing/load-balancers/${string}/server-groups`}
     */
    loadBalancerServerGroup: (lbId) =>
      `/load-balancing/load-balancers/${lbId}/server-groups`,
    /**
     * @param {string} lbId
     * @returns {`/load-balancing/load-balancers/${string}/server-groups/create`}
     */
    loadBalancerServerGroupCreate: (lbId) =>
      `/load-balancing/load-balancers/${lbId}/server-groups/create`,
    /**
     * @param {string} lbId
     * @param {string} serverGroupId
     * @returns {`/load-balancing/load-balancers/${string}/server-groups/${string}/edit`}
     */
    loadBalancerServerGroupEdit: (lbId, serverGroupId) =>
      `/load-balancing/load-balancers/${lbId}/server-groups/${serverGroupId}/edit`,
    /**
     * @param {string} lbId
     * @param {string} serverGroupId
     * @returns {`/load-balancing/load-balancers/${string}/server-groups/${string}/details`}
     */
    loadBalancerServerGroupDetails: (lbId, serverGroupId) =>
      `/load-balancing/load-balancers/${lbId}/server-groups/${serverGroupId}/details`,
    /**
     * @param {string} lbId
     * @param {string} listenerId
     * @returns {`/load-balancing/load-balancers/${string}/listeners/${string}/l7-policies`}
     */
    loadBalancerL7Policy: (lbId, listenerId) =>
      `/load-balancing/load-balancers/${lbId}/listeners/${listenerId}/l7-policies`,
    /**
     * @param {string} lbId
     * @param {string} listenerId
     * @param {string} l7PolicyId
     * @returns {`/load-balancing/load-balancers/${string}/listeners/${string}/l7-policies/${string}/details`}
     */
    loadBalancerL7PolicyDetails: (lbId, listenerId, l7PolicyId) =>
      `/load-balancing/load-balancers/${lbId}/listeners/${listenerId}/l7-policies/${l7PolicyId}/details`,
  },

  kubernetes: {
    home: "/kubernetes",
    clusters: "/kubernetes/clusters",
    clusterCreate: "/kubernetes/clusters/create",
    /**
     * @param {string} clusterId
     * @returns {`/kubernetes/clusters/${string}/edit`}
     */
    clusterEdit: (clusterId) => `/kubernetes/clusters/${clusterId}/edit`,
    /**
     * @param {string} clusterId
     * @returns {`/kubernetes/clusters/${string}/details`}
     */
    clusterDetails: (clusterId) => `/kubernetes/clusters/${clusterId}/details`,
    /**
     * @param {string} clusterId
     * @param {string} tab
     * @returns {`/kubernetes/clusters/${string}/details?tab=${string}`}
     */
    clusterDetailsTab: (clusterId, tab) =>
      `/kubernetes/clusters/${clusterId}/details?tab=${tab}`,
    /**
     * @param {string} clusterId
     * @param {string} nodePoolId
     * @returns {`/kubernetes/clusters/${string}/node-pool/${string}/details`}
     */
    nodePoolDetails: (clusterId, nodePoolId) =>
      `/kubernetes/clusters/${clusterId}/node-pool/${nodePoolId}/details`,
    backupRestore: {
      root: "/kubernetes/backup-restore",
      backupPlan: "/kubernetes/backup-restore/backup-plan",
      backupPlanCreate: "/kubernetes/backup-restore/backup-plan/create",
      /**
       * @param {string} backupPlanId
       * @returns {`/kubernetes/backup-restore/backup-plan/${string}/edit`}
       */
      backupPlanEdit: (backupPlanId) =>
        `/kubernetes/backup-restore/backup-plan/${backupPlanId}/edit`,
      /**
       * @param {string} backupPlanId
       * @returns {`/kubernetes/backup-restore/backup-plan/${string}/details`}
       */
      backupPlanDetails: (backupPlanId) =>
        `/kubernetes/backup-restore/backup-plan/${backupPlanId}/details`,
      storage: "/kubernetes/backup-restore/storage",
      /**
       * @param {string} backupId
       * @returns {`/kubernetes/backup-restore/storage/${string}/details`}
       */
      storageDetails: (backupId) =>
        `/kubernetes/backup-restore/storage/${backupId}/details`,
      restore: "/kubernetes/backup-restore/restore",
      restoreCreate: "/kubernetes/backup-restore/restore/create",
      /**
       * @param {string} restoreId
       * @returns {`/kubernetes/backup-restore/restore/${string}/details`}
       */
      restoreDetails: (restoreId) =>
        `/kubernetes/backup-restore/restore/${restoreId}/details`,
    },
  },

  cloudObservability: {
    home: "/cloud-observability",
    tokens: "/cloud-observability/tokens",
    metricRuleGroups: "/cloud-observability/metric-rule-groups",
    metricRules: "/cloud-observability/metric-rules",
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/metric-rules/${string}/details`}
     */
    metricRuleDetails: (ruleId) =>
      `/cloud-observability/metric-rules/${ruleId}/details`,
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/metric-rules/${string}/edit`}
     */
    metricRuleEdit: (ruleId) =>
      `/cloud-observability/metric-rules/${ruleId}/edit`,
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/metric-rules/${string}/clone`}
     */
    metricRuleClone: (ruleId) =>
      `/cloud-observability/metric-rules/${ruleId}/clone`,
    /**
     * @param {string} groupId
     * @returns {`/cloud-observability/metric-rule-groups/${string}/details`}
     */
    metricRuleGroupDetails: (groupId) =>
      `/cloud-observability/metric-rule-groups/${groupId}/details`,
    /**
     * @param {string} groupId
     * @returns {`/cloud-observability/metric-rule-groups/${string}/create`}
     */
    metricRuleGroupCreate: (groupId) =>
      `/cloud-observability/metric-rule-groups/${groupId}/create`,
    metricRuleTemplates: "/cloud-observability/metric-rule-templates",
    /**
     * @param {string} templateId
     * @returns {`/cloud-observability/metric-rule-templates/${string}/clone`}
     */
    metricRuleTemplateClone: (templateId) =>
      `/cloud-observability/metric-rule-templates/${templateId}/clone`,
    logRuleGroups: "/cloud-observability/log-rule-groups",
    /**
     * @param {string} groupId
     * @returns {`/cloud-observability/log-rule-groups/${string}/details`}
     */
    logRuleGroupDetails: (groupId) =>
      `/cloud-observability/log-rule-groups/${groupId}/details`,
    /**
     * @param {string} groupId
     * @returns {`/cloud-observability/log-rule-groups/${string}/create`}
     */
    logRuleGroupCreate: (groupId) =>
      `/cloud-observability/log-rule-groups/${groupId}/create`,
    logRules: "/cloud-observability/log-rules",
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/log-rules/${string}/details`}
     */
    logRuleDetails: (ruleId) =>
      `/cloud-observability/log-rules/${ruleId}/details`,
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/log-rules/${string}/edit`}
     */
    logRuleEdit: (ruleId) => `/cloud-observability/log-rules/${ruleId}/edit`,
    /**
     * @param {string} ruleId
     * @returns {`/cloud-observability/log-rules/${string}/clone`}
     */
    logRuleClone: (ruleId) => `/cloud-observability/log-rules/${ruleId}/clone`,
    logRuleTemplates: "/cloud-observability/log-rule-templates",
    /**
     * @param {string} templateId
     * @returns {`/cloud-observability/log-rule-templates/${string}/clone`}
     */
    logRuleTemplateClone: (templateId) =>
      `/cloud-observability/log-rule-templates/${templateId}/clone`,
    logStores: "/cloud-observability/log-stores",
    /**
     * @param {string} logStoreId
     * @returns {`/cloud-observability/log-stores/${string}/details`}
     */
    logStoreDetails: (logStoreId) =>
      `/cloud-observability/log-stores/${logStoreId}/details`,
    logStoresCreate: "/cloud-observability/log-stores/create",
    logStoresActivateFeature:
      "/cloud-observability/log-stores/activate-logs-feature",
    /**
     * @param {string} logStoreId
     * @returns {`/cloud-observability/log-stores/${string}/edit`}
     */
    logStoreEdit: (logStoreId) =>
      `/cloud-observability/log-stores/${logStoreId}/edit`,
    dashboardManagement: "/cloud-observability/dashboard-management",
    /**
     * @param {string} dashboardId
     * @returns {`/cloud-observability/dashboard-management/${string}/details`}
     */
    dashboardManagementDetails: (dashboardId) =>
      `/cloud-observability/dashboard-management/${dashboardId}/details`,
    dashboardTemplates: "/cloud-observability/dashboard-templates",
    /**
     * @param {string} templateId
     * @returns {`/cloud-observability/dashboard-templates/${string}/details`}
     */
    dashboardTemplateDetails: (templateId) =>
      `/cloud-observability/dashboard-templates/${templateId}/details`,
    projectInfo: "/cloud-observability/project-info",
    queryMetrics: "/cloud-observability/query-metrics",
    receivers: "/cloud-observability/receivers",
    incidents: "/cloud-observability/incidents",
  },

  vpn: {
    home: "/vpn",
    strongwan: "/vpn/vpn-connections/strongwan",
    strongwanCreate: "/vpn/vpn-connections/strongwan/create",
    /**
     * @param {string} connectionId
     * @returns {`/vpn/vpn-connections/strongwan/${string}/details`}
     */
    strongwanDetails: (connectionId) =>
      `/vpn/vpn-connections/strongwan/${connectionId}/details`,
    wireguard: "/vpn/vpn-connections/wireguard",
    wireguardCreate: "/vpn/vpn-connections/wireguard/create",
    /**
     * @param {string} wireguardId
     * @returns {`/vpn/vpn-connections/wireguard/${string}/details`}
     */
    wireguardDetails: (wireguardId) =>
      `/vpn/vpn-connections/wireguard/${wireguardId}/details`,
    vpnGateways: "/vpn/vpn-gateways",
    vpnGatewaysCreate: "/vpn/vpn-gateways/create",
    /**
     * @param {string} gatewayId
     * @returns {`/vpn/vpn-gateways/${string}/details`}
     */
    vpnGatewayDetails: (gatewayId) => `/vpn/vpn-gateways/${gatewayId}/details`,
    ikePolicies: "/vpn/ike-policies",
    ikePoliciesCreate: "/vpn/ike-policies/create",
    /**
     * @param {string} policyId
     * @returns {`/vpn/ike-policies/${string}/details`}
     */
    ikePolicyDetails: (policyId) => `/vpn/ike-policies/${policyId}/details`,
    ipsecPolicies: "/vpn/ipsec-policies",
    ipsecPoliciesCreate: "/vpn/ipsec-policies/create",
    /**
     * @param {string} policyId
     * @returns {`/vpn/ipsec-policies/${string}/details`}
     */
    ipsecPolicyDetails: (policyId) => `/vpn/ipsec-policies/${policyId}/details`,
    vpnServers: "/vpn/vpn-servers",
    vpnServersCreate: "/vpn/vpn-servers/create",
    /**
     * @param {string} vpnServerId
     * @returns {`/vpn/vpn-servers/${string}/details`}
     */
    vpnServerDetails: (vpnServerId) =>
      `/vpn/vpn-servers/${vpnServerId}/details`,
  },

  dms: {
    home: "/dms",
    endpoints: "/dms/endpoints",
    endpointsCreate: "/dms/endpoints/create",
    migrationTasks: "/dms/migration-tasks",
    migrationTasksCreate: "/dms/migration-tasks/create",
    replicationInstances: "/dms/replication-instances",
    replicationInstanceCreate: "/dms/replication-instances/create",
    /**
     * @param {string} replicationInstanceId
     * @returns {`/dms/replication-instances/${string}/details`}
     */
    replicationInstanceDetails: (replicationInstanceId) =>
      `/dms/replication-instances/${replicationInstanceId}/details`,
    /**
     * @param {string} endpointId
     * @returns {`/dms/endpoints/${string}/details`}
     */
    endpointDetails: (endpointId) => `/dms/endpoints/${endpointId}/details`,
    /**
     * @param {string} migrationTaskId
     * @returns {`/dms/migration-tasks/${string}/details`}
     */
    migrationTaskDetails: (migrationTaskId) =>
      `/dms/migration-tasks/${migrationTaskId}/details`,
  },

  fileStorage: {
    home: "/file-storage",
    filesystem: "/file-storage/filesystem",
    /**
     * @param {string} sourceType
     * @returns {`/file-storage/filesystem/create/${string}`}
     */
    filesystemCreate: (sourceType) =>
      `/file-storage/filesystem/create/${sourceType}`,
    filesystemCreateEmpty: "/file-storage/filesystem/create/empty",
    filesystemCreateSnapshot: "/file-storage/filesystem/create/snapshot",
    /**
     * @param {string} filesystemId
     * @returns {`/file-storage/filesystem/${string}/details`}
     */
    filesystemDetails: (filesystemId) =>
      `/file-storage/filesystem/${filesystemId}/details`,
    /**
     * @param {string} filesystemId
     * @returns {`/file-storage/filesystem/${string}/details?tab=access-rule`}
     */
    filesystemDetailsAccessRuleTab: (filesystemId) =>
      `/file-storage/filesystem/${filesystemId}/details?tab=access-rule`,
    snapshots: "/file-storage/snapshot",
    /**
     * @param {string} snapshotId
     * @returns {`/file-storage/snapshot/${string}/details`}
     */
    snapshotDetails: (snapshotId) =>
      `/file-storage/snapshot/${snapshotId}/details`,
    policies: "/file-storage/policy",
    policyCreate: "/file-storage/policy/create",
    /**
     * @param {string} policyId
     * @returns {`/file-storage/policy/${string}/details`}
     */
    policyDetails: (policyId) => `/file-storage/policy/${policyId}/details`,
    /**
     * @param {string} policyId
     * @returns {`/file-storage/policy/${string}/edit`}
     */
    policyEdit: (policyId) => `/file-storage/policy/${policyId}/edit`,
    /**
     * @param {string} policyId
     * @returns {`/file-storage/policy/${string}/apply`}
     */
    policyApply: (policyId) => `/file-storage/policy/${policyId}/apply`,
  },

  dbaas: {
    home: "/dbaas",
    instances: "/dbaas/instances",
    instanceCreate: "/dbaas/instances/create",
    /**
     * @param {string} instanceId
     * @returns {`/dbaas/instances/${string}/overview`}
     */
    instanceOverview: (instanceId) => `/dbaas/instances/${instanceId}/overview`,
    /**
     * @param {string} instanceId
     * @returns {`/dbaas/instances/${string}/details`}
     */
    instanceDetails: (instanceId) => `/dbaas/instances/${instanceId}/details`,
    backups: "/dbaas/backups",
    /**
     * @param {string} backupId
     * @returns {`/dbaas/backups/${string}/details`}
     */
    backupDetails: (backupId) => `/dbaas/backups/${backupId}/details`,
    /**
     * @param {string} backupId
     * @returns {`/dbaas/backups/${string}/edit`}
     */
    backupEdit: (backupId) => `/dbaas/backups/${backupId}/edit`,
  },

  containerRegistry: {
    home: "/container-registry",
    repositoriesImages: "/container-registry/images",
    actionLogs: "/container-registry/logs",
    /**
     * @param {string} imageName
     * @returns {`/container-registry/images/${string}/details`}
     */
    imageDetails: (imageName) =>
      `/container-registry/images/${imageName}/details`,
  },

  kms: {
    home: "/kms",
    key: "/kms/key",
    keyCreate: "/kms/key/create",
    /**
     * @param {string} keyId
     * @returns {`/kms/key/${string}/details`}
     */
    keyDetails: (keyId) => `/kms/key/${keyId}/details`,
    secret: "/kms/secret",
    secretCreate: "/kms/secret/create",
    /**
     * @param {string} secretId
     * @returns {`/kms/secret/${string}/edit`}
     */
    secretEdit: (secretId) => `/kms/secret/${secretId}/edit`,
    /**
     * @param {string} secretId
     * @returns {`/kms/secret/${string}/details`}
     */
    secretDetails: (secretId) => `/kms/secret/${secretId}/details`,
    sslCertificate: "/kms/ssl-certificate",
    sslCertificateCreate: "/kms/ssl-certificate/create",
    /**
     * @param {string} certificateId
     * @returns {`/kms/ssl-certificate/${string}/details`}
     */
    sslCertificateDetails: (certificateId) =>
      `/kms/ssl-certificate/${certificateId}/details`,
  },

  project: {
    home: "/project",
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/billing`}
     */
    billing: (projectId) => `/project/${projectId}/billing`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/roles/create`}
     */
    rolesCreate: (projectId) => `/project/${projectId}/roles/create`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/roles`}
     */
    roles: (projectId) => `/project/${projectId}/roles`,
    /**
     * @param {string} projectId
     * @param {string} roleId
     * @returns {`/project/${string}/roles/${string}/edit`}
     */
    roleEdit: (projectId, roleId) =>
      `/project/${projectId}/roles/${roleId}/edit`,
    /**
     * @param {string} projectId
     * @param {string} roleId
     * @returns {`/project/${string}/roles/${string}/details`}
     */
    roleDetails: (projectId, roleId) =>
      `/project/${projectId}/roles/${roleId}/details`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/regions`}
     */
    regions: (projectId) => `/project/${projectId}/regions`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/overview`}
     */
    overview: (projectId) => `/project/${projectId}/overview`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/quotas`}
     */
    quotas: (projectId) => `/project/${projectId}/quotas`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/members`}
     */
    members: (projectId) => `/project/${projectId}/members`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/members/invite`}
     */
    membersInvite: (projectId) => `/project/${projectId}/members/invite`,
    /**
     * @param {string} projectId
     * @param {string} memberId
     * @returns {`/project/${string}/members/${string}/edit`}
     */
    memberEdit: (projectId, memberId) =>
      `/project/${projectId}/members/${memberId}/edit`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/billing/transactions`}
     */
    billingTransactions: (projectId) =>
      `/project/${projectId}/billing/transactions`,
    /**
     * @param {string} projectId
     * @param {string} billId
     * @returns {`/project/${string}/billing/transactions/${string}/details`}
     */
    billingTransactionDetails: (projectId, billId) =>
      `/project/${projectId}/billing/transactions/${billId}/details`,
    /**
     * @param {string} projectId
     * @returns {`/project/${string}/billing/cost-reports`}
     */
    billingCostReports: (projectId) =>
      `/project/${projectId}/billing/cost-reports`,
    /**
     * @param {string} projectId
     * @param {string} billId
     * @returns {`/project/${string}/billing/cost-reports/${string}/details`}
     */
    billingCostReportDetails: (projectId, billId) =>
      `/project/${projectId}/billing/cost-reports/${billId}/details`,
  },

  auth: {
    home: "/auth",
    login: "/auth/login",
    /**
     * @param {string} returnUrl
     * @returns {`/auth/login?returnUrl=${string}`}
     */
    loginReturnUrl: (returnUrl) => `/auth/login?returnUrl=${returnUrl}`,
  },
};

export const EXTERNAL_LINK = /** @type {const} */ {
  landingPage: "https://viettelcloud.vn",
  /**
   * @param {string} locale
   * @returns {`https://viettelcloud.vn/${string}/products/8/30`}
   */
  kubernetesEngine: (locale) =>
    `https://viettelcloud.vn/${locale}/products/8/30`,
};
