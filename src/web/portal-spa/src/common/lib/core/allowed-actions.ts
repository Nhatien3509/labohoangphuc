import { BASE_PATH } from "@common/lib/core/const";

export const actions = {
  vpn: {
    vpnServer: {
      create: "urn:action:vpn:vpn_server:create",
      delete: "urn:action:vpn:vpn_server:delete",
      get: "urn:action:vpn:vpn_server:get",
      list: "urn:action:vpn:vpn_server:list",
      update: "urn:action:vpn:vpn_server:update",
      addSubnet: "urn:action:vpn:vpn_server:add_subnet",
      removeSubnet: "urn:action:vpn:vpn_server:remove_subnet",
      getClientConfig: "urn:action:vpn:vpn_server:get_client_config",
      importCrl: "urn:action:vpn:vpn_server:import_crl",
      listConnections: "urn:action:vpn:vpn_server:list_connections",
    },
    vpnGateway: {
      create: "urn:action:vpn:vpn_gateway:create",
      delete: "urn:action:vpn:vpn_gateway:delete",
      get: "urn:action:vpn:vpn_gateway:get",
      list: "urn:action:vpn:vpn_gateway:list",
      update: "urn:action:vpn:vpn_gateway:update",
    },
    vpnConnection: {
      create: "urn:action:vpn:vpn_connection:create",
      delete: "urn:action:vpn:vpn_connection:delete",
      get: "urn:action:vpn:vpn_connection:get",
      list: "urn:action:vpn:vpn_connection:list",
      update: "urn:action:vpn:vpn_connection:update",
      attachSubnet: "urn:action:vpn:vpn_connection:attach_subnet",
      detachSubnet: "urn:action:vpn:vpn_connection:detach_subnet",
    },
    ipsecPolicy: {
      create: "urn:action:vpn:ipsec_policy:create",
      delete: "urn:action:vpn:ipsec_policy:delete",
      get: "urn:action:vpn:ipsec_policy:get",
      list: "urn:action:vpn:ipsec_policy:list",
      update: "urn:action:vpn:ipsec_policy:update",
    },
    ikePolicy: {
      create: "urn:action:vpn:ike_policy:create",
      delete: "urn:action:vpn:ike_policy:delete",
      get: "urn:action:vpn:ike_policy:get",
      list: "urn:action:vpn:ike_policy:list",
      update: "urn:action:vpn:ike_policy:update",
    },
  },

  volumeBackup: {
    policy: {
      create: "urn:action:volume_backup:volume_backup_policy:create",
      delete: "urn:action:volume_backup:volume_backup_policy:delete",
      get: "urn:action:volume_backup:volume_backup_policy:get",
      list: "urn:action:volume_backup:volume_backup_policy:list",
      update: "urn:action:volume_backup:volume_backup_policy:update",
    },
    backup: {
      create: "urn:action:volume_backup:volume_backup:create",
      delete: "urn:action:volume_backup:volume_backup:delete",
      get: "urn:action:volume_backup:volume_backup:get",
      list: "urn:action:volume_backup:volume_backup:list",
      update: "urn:action:volume_backup:volume_backup:update",
      restore: "urn:action:volume_backup:volume_backup:restore",
    },
  },

  tenant: {
    quota: {
      batchCreate: "urn:action:tenant:quota:batch_create",
      batchDelete: "urn:action:tenant:quota:batch_delete",
    },
    project: {
      activateService: "urn:action:tenant:project:activate_service",
      get: "urn:action:tenant:project:get",
    },
  },

  objectStorage: {
    versionedObject: {
      updateTags: "urn:action:object_storage:versioned_object:update_tags",
      updateObjectLock:
        "urn:action:object_storage:versioned_object:update_object_lock",
      updateMetadata:
        "urn:action:object_storage:versioned_object:update_metadata",
      updateAcl: "urn:action:object_storage:versioned_object:update_acl",
      share: "urn:action:object_storage:versioned_object:share",
      restore: "urn:action:object_storage:versioned_object:restore",
      listTags: "urn:action:object_storage:versioned_object:list_tags",
      list: "urn:action:object_storage:versioned_object:list",
      getMetadata: "urn:action:object_storage:versioned_object:get_metadata",
      getAcl: "urn:action:object_storage:versioned_object:get_acl",
      get: "urn:action:object_storage:versioned_object:get",
      deleteTags: "urn:action:object_storage:versioned_object:delete_tags",
      delete: "urn:action:object_storage:versioned_object:delete",
      batchDelete: "urn:action:object_storage:versioned_object:batch_delete",
    },
    s3Key: {
      list: "urn:action:object_storage:s3_key:list",
      delete: "urn:action:object_storage:s3_key:delete",
      create: "urn:action:object_storage:s3_key:create",
    },
    object: {
      updateTags: "urn:action:object_storage:object:update_tags",
      updateObjectLock: "urn:action:object_storage:object:update_object_lock",
      updateMetadata: "urn:action:object_storage:object:update_metadata",
      updateAcl: "urn:action:object_storage:object:update_acl",
      share: "urn:action:object_storage:object:share",
      listTags: "urn:action:object_storage:object:list_tags",
      list: "urn:action:object_storage:object:list",
      getUploadToken: "urn:action:object_storage:object:get_upload_token",
      getMetadata: "urn:action:object_storage:object:get_metadata",
      getAcl: "urn:action:object_storage:object:get_acl",
      get: "urn:action:object_storage:object:get",
      deleteTags: "urn:action:object_storage:object:delete_tags",
      delete: "urn:action:object_storage:object:delete",
      createDirectory: "urn:action:object_storage:object:create_directory",
      batchDelete: "urn:action:object_storage:object:batch_delete",
    },
    multipart: {
      listMultiparts: "urn:action:object_storage:multipart:list_multiparts",
      getMultipartStats:
        "urn:action:object_storage:multipart:get_multipart_stats",
      deleteMultipartsBatch:
        "urn:action:object_storage:multipart:delete_multiparts_batch",
      deleteAllMultiparts:
        "urn:action:object_storage:multipart:delete_all_multiparts",
    },
    keyGroup: {
      listS3Key: "urn:action:object_storage:key_group:list_s3_key",
      list: "urn:action:object_storage:key_group:list",
      deleteS3Key: "urn:action:object_storage:key_group:delete_s3_key",
      delete: "urn:action:object_storage:key_group:delete",
      createS3Key: "urn:action:object_storage:key_group:create_s3_key",
      create: "urn:action:object_storage:key_group:create",
    },
    bucket: {
      updateVersioning: "urn:action:object_storage:bucket:update_versioning",
      updateTags: "urn:action:object_storage:bucket:update_tags",
      updateStaticWeb: "urn:action:object_storage:bucket:update_static_web",
      updatePolicy: "urn:action:object_storage:bucket:update_policy",
      updateLifecycles: "urn:action:object_storage:bucket:update_lifecycles",
      updateCors: "urn:action:object_storage:bucket:update_cors",
      updateBucketLock: "urn:action:object_storage:bucket:update_bucket_lock",
      updateAcl: "urn:action:object_storage:bucket:update_acl",
      listTags: "urn:action:object_storage:bucket:list_tags",
      listPermission: "urn:action:object_storage:bucket:list_permission",
      listLifecycles: "urn:action:object_storage:bucket:list_lifecycles",
      listCors: "urn:action:object_storage:bucket:list_cors",
      listAccess: "urn:action:object_storage:bucket:list_access",
      list: "urn:action:object_storage:bucket:list",
      getVersioning: "urn:action:object_storage:bucket:get_versioning",
      getStaticWeb: "urn:action:object_storage:bucket:get_static_web",
      getPolicy: "urn:action:object_storage:bucket:get_policy",
      getMetricsSchema: "urn:action:object_storage:bucket:get_metrics_schema",
      getMetrics: "urn:action:object_storage:bucket:get_metrics",
      getLogFileUrl: "urn:action:object_storage:bucket:get_log_file_url",
      getLock: "urn:action:object_storage:bucket:get_lock",
      getAcl: "urn:action:object_storage:bucket:get_acl",
      get: "urn:action:object_storage:bucket:get",
      enableAccess: "urn:action:object_storage:bucket:enable_access",
      disableAccess: "urn:action:object_storage:bucket:disable_access",
      deleteTags: "urn:action:object_storage:bucket:delete_tags",
      deleteStaticWeb: "urn:action:object_storage:bucket:delete_static_web",
      deletePolicy: "urn:action:object_storage:bucket:delete_policy",
      deletePermission: "urn:action:object_storage:bucket:delete_permission",
      deleteLifecycles: "urn:action:object_storage:bucket:delete_lifecycles",
      deleteCors: "urn:action:object_storage:bucket:delete_cors",
      deleteAccess: "urn:action:object_storage:bucket:delete_access",
      delete: "urn:action:object_storage:bucket:delete",
      createPermission: "urn:action:object_storage:bucket:create_permission",
      createAccess: "urn:action:object_storage:bucket:create_access",
      create: "urn:action:object_storage:bucket:create",
    },
  },

  monitoring: {
    alarm: {
      update: "urn:action:monitoring:alarm:update",
      list: "urn:action:monitoring:alarm:list",
      get: "urn:action:monitoring:alarm:get",
      delete: "urn:action:monitoring:alarm:delete",
      create: "urn:action:monitoring:alarm:create",
    },
  },

  loadBalancing: {
    serverGroup: {
      update: "urn:action:load_balancing:server_group:update",
      list: "urn:action:load_balancing:server_group:list",
      get: "urn:action:load_balancing:server_group:get",
      delete: "urn:action:load_balancing:server_group:delete",
      create: "urn:action:load_balancing:server_group:create",
      batchUpdateMembers:
        "urn:action:load_balancing:server_group:batch_update_members",
    },
    rateLimit: {
      update: "urn:action:load_balancing:rate_limit:update",
      list: "urn:action:load_balancing:rate_limit:list",
      get: "urn:action:load_balancing:rate_limit:get",
      delete: "urn:action:load_balancing:rate_limit:delete",
      create: "urn:action:load_balancing:rate_limit:create",
    },
    member: {
      update: "urn:action:load_balancing:member:update",
      list: "urn:action:load_balancing:member:list",
      get: "urn:action:load_balancing:member:get",
      delete: "urn:action:load_balancing:member:delete",
      create: "urn:action:load_balancing:member:create",
    },
    loadBalancer: {
      update: "urn:action:load_balancing:load_balancer:update",
      list: "urn:action:load_balancing:load_balancer:list",
      getMetricsSchema:
        "urn:action:load_balancing:load_balancer:get_metrics_schema",
      getMetrics: "urn:action:load_balancing:load_balancer:get_metrics",
      get: "urn:action:load_balancing:load_balancer:get",
      detachPublicIp:
        "urn:action:load_balancing:load_balancer:detach_public_ip",
      delete: "urn:action:load_balancing:load_balancer:delete",
      create: "urn:action:load_balancing:load_balancer:create",
      attachPublicIp:
        "urn:action:load_balancing:load_balancer:attach_public_ip",
    },
    listener: {
      update: "urn:action:load_balancing:listener:update",
      list: "urn:action:load_balancing:listener:list",
      getMetricsSchema: "urn:action:load_balancing:listener:get_metrics_schema",
      getMetrics: "urn:action:load_balancing:listener:get_metrics",
      get: "urn:action:load_balancing:listener:get",
      delete: "urn:action:load_balancing:listener:delete",
      create: "urn:action:load_balancing:listener:create",
    },
    l7Rule: {
      update: "urn:action:load_balancing:l7_rule:update",
      list: "urn:action:load_balancing:l7_rule:list",
      get: "urn:action:load_balancing:l7_rule:get",
      delete: "urn:action:load_balancing:l7_rule:delete",
      create: "urn:action:load_balancing:l7_rule:create",
    },
    l7Policy: {
      update: "urn:action:load_balancing:l7_policy:update",
      list: "urn:action:load_balancing:l7_policy:list",
      get: "urn:action:load_balancing:l7_policy:get",
      delete: "urn:action:load_balancing:l7_policy:delete",
      create: "urn:action:load_balancing:l7_policy:create",
    },
    authUser: {
      list: "urn:action:load_balancing:auth_user:list",
      get: "urn:action:load_balancing:auth_user:get",
      delete: "urn:action:load_balancing:auth_user:delete",
      create: "urn:action:load_balancing:auth_user:create",
      changePassword: "urn:action:load_balancing:auth_user:change_password",
    },
  },

  kms: {
    secret: {
      update: "urn:action:kms:secret:update",
      list: "urn:action:kms:secret:list",
      getMetadata: "urn:action:kms:secret:get_metadata",
      get: "urn:action:kms:secret:get",
      delete: "urn:action:kms:secret:delete",
      createMetadata: "urn:action:kms:secret:create_metadata",
      create: "urn:action:kms:secret:create",
    },
    key: {
      list: "urn:action:kms:key:list",
      get: "urn:action:kms:key:get",
      delete: "urn:action:kms:key:delete",
      create: "urn:action:kms:key:create",
    },
    certificate: {
      list: "urn:action:kms:certificate:list",
      get: "urn:action:kms:certificate:get",
      delete: "urn:action:kms:certificate:delete",
      create: "urn:action:kms:certificate:create",
    },
  },

  iam: {
    accessPolicy: {
      delete: "urn:action:iam:access_policy:delete",
      create: "urn:action:iam:access_policy:create",
      update: "urn:action:iam:access_policy:update",
      list: "urn:action:iam:access_policy:list",
      get: "urn:action:iam:access_policy:get",
    },
  },

  filesystem: {
    filesystemSnapshotPolicy: {
      update: "urn:action:filesystem:filesystem_snapshot_policy:update",
      list: "urn:action:filesystem:filesystem_snapshot_policy:list",
      get: "urn:action:filesystem:filesystem_snapshot_policy:get",
      delete: "urn:action:filesystem:filesystem_snapshot_policy:delete",
      create: "urn:action:filesystem:filesystem_snapshot_policy:create",
    },
    filesystemSnapshot: {
      update: "urn:action:filesystem:filesystem_snapshot:update",
      list: "urn:action:filesystem:filesystem_snapshot:list",
      get: "urn:action:filesystem:filesystem_snapshot:get",
      delete: "urn:action:filesystem:filesystem_snapshot:delete",
      create: "urn:action:filesystem:filesystem_snapshot:create",
    },
    filesystemMountTarget: {
      list: "urn:action:filesystem:filesystem_mount_target:list",
      get: "urn:action:filesystem:filesystem_mount_target:get",
      delete: "urn:action:filesystem:filesystem_mount_target:delete",
      create: "urn:action:filesystem:filesystem_mount_target:create",
    },
    filesystemBackup: {
      update: "urn:action:filesystem:filesystem_backup:update",
      restore: "urn:action:filesystem:filesystem_backup:restore",
      list: "urn:action:filesystem:filesystem_backup:list",
      get: "urn:action:filesystem:filesystem_backup:get",
      delete: "urn:action:filesystem:filesystem_backup:delete",
      create: "urn:action:filesystem:filesystem_backup:create",
    },
    filesystem: {
      update: "urn:action:filesystem:filesystem:update",
      unapplyPolicy: "urn:action:filesystem:filesystem:unapply_policy",
      startMigration: "urn:action:filesystem:filesystem:start_migration",
      resize: "urn:action:filesystem:filesystem:resize",
      list: "urn:action:filesystem:filesystem:list",
      getMetricsSchema: "urn:action:filesystem:filesystem:get_metrics_schema",
      getMetrics: "urn:action:filesystem:filesystem:get_metrics",
      get: "urn:action:filesystem:filesystem:get",
      delete: "urn:action:filesystem:filesystem:delete",
      create: "urn:action:filesystem:filesystem:create",
      applyPolicy: "urn:action:filesystem:filesystem:apply_policy",
    },
    filesystemAccessRule: {
      list: "urn:action:filesystem:filesystem_access_rule:list",
      get: "urn:action:filesystem:filesystem_access_rule:get",
      delete: "urn:action:filesystem:filesystem_access_rule:delete",
      create: "urn:action:filesystem:filesystem_access_rule:create",
    },
  },

  dpc: {
    listServers: "urn:action:dpc:dpc:list_servers",
    listComputes: "urn:action:dpc:dpc:list_computes",
    list: "urn:action:dpc:dpc:list",
    get: "urn:action:dpc:dpc:get",
  },

  dns: {
    zone: {
      refresh: "urn:action:dns:zone:refresh",
      update: "urn:action:dns:zone:update",
      list: "urn:action:dns:zone:list",
      get: "urn:action:dns:zone:get",
      delete: "urn:action:dns:zone:delete",
      create: "urn:action:dns:zone:create",
    },
    rrset: {
      list: "urn:action:dns:rrset:list",
      get: "urn:action:dns:rrset:get",
      delete: "urn:action:dns:rrset:delete",
      create: "urn:action:dns:rrset:create",
    },
  },

  dbaas: {
    dbInstanceAdvancedConfig: {
      compare: "urn:action:dbaas:db_instance_advanced_config:compare",
      apply: "urn:action:dbaas:db_instance_advanced_config:apply",
      list: "urn:action:dbaas:db_instance_advanced_config:list",
    },
    dbInstanceQuery: {
      kill: "urn:action:dbaas:db_instance_query:kill",
      list: "urn:action:dbaas:db_instance_query:list",
    },
    dbInstanceConnectionPool: {
      delete: "urn:action:dbaas:db_instance_connection_pool:delete",
      update: "urn:action:dbaas:db_instance_connection_pool:update",
      get: "urn:action:dbaas:db_instance_connection_pool:get",
      list: "urn:action:dbaas:db_instance_connection_pool:list",
      create: "urn:action:dbaas:db_instance_connection_pool:create",
    },
    dbInstanceReplica: {
      update: "urn:action:dbaas:db_instance_replica:update",
      list: "urn:action:dbaas:db_instance_replica:list",
      get: "urn:action:dbaas:db_instance_replica:get",
      delete: "urn:action:dbaas:db_instance_replica:delete",
      create: "urn:action:dbaas:db_instance_replica:create",
    },
    dbInstanceBackup: {
      update: "urn:action:dbaas:db_instance_backup:update",
      list: "urn:action:dbaas:db_instance_backup:list",
      get: "urn:action:dbaas:db_instance_backup:get",
      delete: "urn:action:dbaas:db_instance_backup:delete",
      create: "urn:action:dbaas:db_instance_backup:create",
    },
    dbInstance: {
      upgradeMinorVersion: "urn:action:dbaas:db_instance:upgrade_minor_version",
      updateUserPassword: "urn:action:dbaas:db_instance:update_user_password",
      updateRootPassword: "urn:action:dbaas:db_instance:update_root_password",
      updateKeepBackupPolicy:
        "urn:action:dbaas:db_instance:update_keep_backup_policy",
      updateInstanceAccessibility:
        "urn:action:dbaas:db_instance:update_instance_accessibility",
      updateFlavor: "urn:action:dbaas:db_instance:update_flavor",
      updateBackupPolicy: "urn:action:dbaas:db_instance:update_backup_policy",
      updateAutoIncreaseVolumeSizeConfig:
        "urn:action:dbaas:db_instance:update_auto_increase_volume_size_config",
      updateAdvancedConfigurationParameters:
        "urn:action:dbaas:db_instance:update_advanced_configuration_parameters",
      revokeDatabaseAccess:
        "urn:action:dbaas:db_instance:revoke_database_access",
      listUsers: "urn:action:dbaas:db_instance:list_users",
      listLogFiles: "urn:action:dbaas:db_instance:list_log_files",
      listDatabases: "urn:action:dbaas:db_instance:list_databases",
      listAdvancedConfigurationParameters:
        "urn:action:dbaas:db_instance:list_advanced_configuration_parameters",
      listAccesses: "urn:action:dbaas:db_instance:list_accesses",
      list: "urn:action:dbaas:db_instance:list",
      grantDatabaseAccess: "urn:action:dbaas:db_instance:grant_database_access",
      getSslCaCert: "urn:action:dbaas:db_instance:get_ssl_ca_cert",
      getOperationLogs: "urn:action:dbaas:db_instance:get_operation_logs",
      getMetricsSchema: "urn:action:dbaas:db_instance:get_metrics_schema",
      getMetrics: "urn:action:dbaas:db_instance:get_metrics",
      get: "urn:action:dbaas:db_instance:get",
      extendVolumeSize: "urn:action:dbaas:db_instance:extend_volume_size",
      downloadLogFile: "urn:action:dbaas:db_instance:download_log_file",
      deleteUser: "urn:action:dbaas:db_instance:delete_user",
      deleteDatabase: "urn:action:dbaas:db_instance:delete_database",
      delete: "urn:action:dbaas:db_instance:delete",
      createUser: "urn:action:dbaas:db_instance:create_user",
      createDatabase: "urn:action:dbaas:db_instance:create_database",
      create: "urn:action:dbaas:db_instance:create",
    },
  },

  autoScaling: {
    server: {
      list: "urn:action:auto_scaling:server:list",
    },
    schedule: {
      update: "urn:action:auto_scaling:schedule:update",
      list: "urn:action:auto_scaling:schedule:list",
      get: "urn:action:auto_scaling:schedule:get",
      delete: "urn:action:auto_scaling:schedule:delete",
      create: "urn:action:auto_scaling:schedule:create",
    },
    policy: {
      update: "urn:action:auto_scaling:policy:update",
      list: "urn:action:auto_scaling:policy:list",
      get: "urn:action:auto_scaling:policy:get",
      delete: "urn:action:auto_scaling:policy:delete",
      create: "urn:action:auto_scaling:policy:create",
    },
    group: {
      update: "urn:action:auto_scaling:group:update",
      list: "urn:action:auto_scaling:group:list",
      getMetricsSchema: "urn:action:auto_scaling:group:get_metrics_schema",
      getMetrics: "urn:action:auto_scaling:group:get_metrics",
      get: "urn:action:auto_scaling:group:get",
      delete: "urn:action:auto_scaling:group:delete",
      createFromServer: "urn:action:auto_scaling:group:create_from_server",
      create: "urn:action:auto_scaling:group:create",
    },
    action: {
      list: "urn:action:auto_scaling:action:list",
    },
  },
};

export function getActionByPath(
  path: string,
  routes: { urn: string; pattern: string }[],
): string {
  const matchedAction = routes.find(({ pattern }) => {
    const regexPattern = `${BASE_PATH}${pattern}`.replace(/:\w+/g, "([^/]+)");
    const regex = new RegExp(`^${regexPattern}$`);

    return regex.test(path);
  });

  return matchedAction ? matchedAction.urn : "";
}
