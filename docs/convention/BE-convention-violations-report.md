# Báo cáo chi tiết vi phạm convention — Backend (Go services)

> Quét **LIVE** bằng `tools/convention-scan` ngày **17/06/2026** (Go local). Liệt kê **từng dòng** vi phạm (không dedupe).
> Mức độ: **CRITICAL** = scanner chặn push; **HIGH/MEDIUM/LOW** = phân loại rủi ro từ nhóm WARNING của scanner.

**Tổng: 1265 vi phạm** — 🔴 CRITICAL 80 · 🟠 HIGH 743 · 🟡 MEDIUM 439 · ⚪ LOW 3

## Tổng hợp theo service × mức độ

| Service | CRITICAL | HIGH | MEDIUM | LOW | Tổng |
|---|---:|---:|---:|---:|---:|
| admin-service | 42 | 589 | 318 | 3 | 952 |
| integration-service | 15 | 94 | 61 | 0 | 170 |
| audit-service | 7 | 12 | 19 | 0 | 38 |
| sharing-service | 4 | 13 | 10 | 0 | 27 |
| file-downloader-service | 9 | 11 | 4 | 0 | 24 |
| mock_datasource | 3 | 9 | 12 | 0 | 24 |
| (deploy) | 0 | 9 | 10 | 0 | 19 |
| (tools) | 0 | 4 | 3 | 0 | 7 |
| masking-service | 0 | 1 | 1 | 0 | 2 |
| monitoring-service | 0 | 1 | 1 | 0 | 2 |

## 🔴 CRITICAL — 80 vi phạm

### context.Background()/TODO() trong business logic — 44

- **Lỗi cụ thể:** Dùng context.Background()/TODO() trong business logic → mất khả năng hủy/timeout/trace của request.
- **Hướng khắc phục:** Dùng c.Request.Context() (handler) hoặc nhận ctx từ caller; nếu cần detach dùng context.WithoutCancel(ctx)

**Vị trí:**

- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.ImportCategories` — L488
- `src/services/admin-service/internal/pkg/jobscheduler/scheduler.go` · `*Scheduler.registerLocked` — L119
- `src/services/admin-service/internal/service/kafka_manager.go` · `*KafkaManager.DeleteTopic` — L197
- `src/services/admin-service/internal/service/kafka_manager.go` · `*KafkaManager.EnsureTopicExists` — L102
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.GetConsumerGroupLag` — L249
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.ListConsumerGroups` — L228
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.PeekMessages` — L202
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.ResetConsumerGroupOffset` — L311
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.UpdateTopicConfig` — L403
- `src/services/admin-service/internal/service/notifier.go` · `*Notifier.Notify` — L58
- `src/services/admin-service/internal/service/notifier.go` · `*Notifier.NotifyWithEvent` — L115
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.CheckHealth` — L792
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.GetLatestSchema` — L750
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.InvalidateSubjectCache` — L971
- `src/services/admin-service/pkg/logger/logger.go` · `Init` — L52
- `src/services/admin-service/pkg/logger/logger.go` · `buildOtelProvider` — L72
- `src/services/admin-service/pkg/tracer/tracer.go` · `Init` — L34, L40, L57
- `src/services/audit-service/pkg/logger/logger.go` · `Init` — L51
- `src/services/audit-service/pkg/logger/logger.go` · `buildOtelProvider` — L73
- `src/services/audit-service/pkg/tracer/tracer.go` · `Init` — L34, L40, L56
- `src/services/file-downloader-service/internal/uploader/ozone.go` · `New` — L22, L37
- `src/services/file-downloader-service/pkg/logger/logger.go` · `Init` — L44
- `src/services/file-downloader-service/pkg/logger/logger.go` · `buildOtelProvider` — L66
- `src/services/file-downloader-service/pkg/tracer/tracer.go` · `Init` — L34, L40, L56
- `src/services/integration-service/internal/core/pipeline/sync_engine.go` · `*SyncEngine.Run` — L173, L193
- `src/services/integration-service/internal/core/pipeline/sync_engine.go` · `*SyncEngine.runWorker` — L345
- `src/services/integration-service/internal/handler/sync_handler.go` · `*SyncHandler.Run` — L112
- `src/services/integration-service/internal/service/job_service.go` · `*jobSvc.Trigger` — L79
- `src/services/integration-service/pkg/logger/logger.go` · `Init` — L51
- `src/services/integration-service/pkg/logger/logger.go` · `buildOtelProvider` — L73
- `src/services/integration-service/pkg/meter/meter.go` · `Init` — L32, L38, L61
- `src/services/integration-service/pkg/tracer/tracer.go` · `Init` — L34, L40, L56

### Fat handler (>30 dòng / gọi IO trực tiếp) — 29

- **Lỗi cụ thể:** Handler dài >30 dòng hoặc gọi thẳng DB/HTTP → vi phạm tách lớp handler/service/repository.
- **Hướng khắc phục:** Chuyển business logic vào service layer; handler chỉ parse request + gọi service

**Vị trí:**

- `src/services/admin-service/internal/handler/admin_system_log_handler.go` · `*AdminSystemLogHandler.Search` — L59
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.ImportCategories` — L454
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.ImportCategoryData` — L521
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetTrend7Days` — L83
- `src/services/admin-service/internal/handler/data-sharing-config/handler.go` · `*DataSharingConfigHandler.List` — L184
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetJob` — L215
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.ListJobs` — L172
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.SubmitJob` — L258
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.UploadJar` — L102
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.PeekMessages` — L172
- `src/services/admin-service/internal/handler/kho-mo-sync/handler.go` · `*Handler.TriggerSync` — L109
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.SyncManual` — L41
- `src/services/admin-service/internal/handler/quan-tri-phan-mem/handler.go` · `*ConnectedSystemHandler.List` — L195
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Update` — L162
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.ReadSchemaFromExcel` — L384
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.RegisterSchema` — L320
- `src/services/admin-service/internal/handler/schema-wrapper/handler.go` · `*SchemaWrapperHandler.List` — L118
- `src/services/admin-service/internal/handler/ttdl/handler.go` · `*Handler.CreateJobThuThapDuLieu` — L93
- `src/services/admin-service/internal/handler/ttdl/handler.go` · `*Handler.triggerPullJob` — L127
- `src/services/audit-service/internal/handler/signoz_handler.go` · `*SignozHandler.QueryLogs` — L47
- `src/services/audit-service/internal/handler/signoz_handler.go` · `*SignozHandler.QueryLogsByTraceID` — L100
- `src/services/integration-service/internal/handler/sync_handler.go` · `*SyncHandler.Run` — L55
- `src/services/mock_datasource/internal/handler/search_handler.go` · `*SearchHandler.TimKiemDuLieu` — L26
- `src/services/mock_datasource/internal/handler/search_handler.go` · `toDetailDTO` — L177
- `src/services/mock_datasource/internal/handler/search_handler.go` · `toSearchItemDTO` — L120
- `src/services/sharing-service/internal/handler/share_handler.go` · `*ShareHandler.Share` — L67
- `src/services/sharing-service/internal/handler/share_handler.go` · `*ShareHandler.writeAccessLog` — L196
- `src/services/sharing-service/internal/handler/summary_handler.go` · `*SummaryHandler.GetFlowRanking` — L92
- `src/services/sharing-service/internal/handler/summary_handler.go` · `*SummaryHandler.GetSummary` — L127

### Hardcoded secret (lộ bí mật) — 7

- **Lỗi cụ thể:** Đặt giá trị bí mật (mật khẩu/secret/api-key) làm default literal trong code → lộ trong repo/image.
- **Hướng khắc phục:** Bỏ default, yêu cầu env var bắt buộc hoặc dùng Vault

**Vị trí:**

- `src/services/admin-service/internal/config/config.go:158` · `LoadConfig` — viper.SetDefault("DB_PASS", "secret")
- `src/services/admin-service/internal/config/config.go:208` · `LoadConfig` — viper.SetDefault("JWT_SECRET", "dev-secret-do-not-us…")
- `src/services/admin-service/internal/config/config.go:211` · `LoadConfig` — viper.SetDefault("SSO_SYNC_API_KEY", "api-key")
- `src/services/admin-service/internal/config/config.go:224` · `LoadConfig` — viper.SetDefault("CATEGORY_DB_PASS", "secret")
- `src/services/file-downloader-service/internal/config/config.go:79` · `Load` — viper.SetDefault("GET_LINK_API_KEY_NAME", "apikey")
- `src/services/file-downloader-service/internal/config/config.go:81` · `Load` — viper.SetDefault("DOWNLOAD_API_KEY_NAME", "apikey")
- `src/services/integration-service/internal/config/config.go:56` · `Load` — viper.SetDefault("DB_PASS", "secret")


## 🟠 HIGH — 743 vi phạm

### return err không wrap context — 727

- **Lỗi cụ thể:** Trả `return err` trần, không kèm ngữ cảnh → khó truy vết nguồn lỗi.
- **Hướng khắc phục:** Dùng fmt.Errorf("...: %w", err) hoặc errors.Wrap(err, "context")

**Vị trí:**

- `src/services/admin-service/external/service/kho-mo/client.go` · `NewClient` — L15
- `src/services/admin-service/internal/client/sharing_client.go` · `*SharingClient.GetSharingFlowRanking` — L106, L110, L125
- `src/services/admin-service/internal/client/sharing_client.go` · `*SharingClient.GetSharingLatestFlows` — L69, L73, L87
- `src/services/admin-service/internal/client/sharing_client.go` · `*SharingClient.GetSharingSummary` — L30, L34, L50
- `src/services/admin-service/internal/dto/danh-muc/mapper/category_mapper.go` · `parseTruongCauHinhJSON` — L73
- `src/services/admin-service/internal/handler/route_config_handler.go` · `parseID` — L300
- `src/services/admin-service/internal/middleware/permission_middleware.go` · `getUserIDBySoCCCD` — L120
- `src/services/admin-service/internal/middleware/permission_middleware.go` · `hasDirectPermission` — L143
- `src/services/admin-service/internal/middleware/permission_middleware.go` · `hasGroupPermission` — L174
- `src/services/admin-service/internal/model/schema/hive_schema.go` · `BuildHiveSchemaFromFields` — L33
- `src/services/admin-service/internal/model/schema/hive_schema.go` · `BuildHiveSchemaFromValidationRulesJSON` — L20
- `src/services/admin-service/internal/model/schema/iceberg_schema.go` · `BuildIcebergSchemaFromFields` — L25
- `src/services/admin-service/internal/model/schema/iceberg_schema.go` · `BuildIcebergSchemaFromValidationRulesJSON` — L14
- `src/services/admin-service/internal/model/schema/nifi_schema.go` · `BuildNifiXMLFromValidationRulesJSON` — L30
- `src/services/admin-service/internal/model/schema/schema_version.go` · `BuildWarehouseSchemaFromAvroSchema` — L62, L68
- `src/services/admin-service/internal/model/schema/validation_rules_checked_fields.go` · `ExtractCheckedFieldPaths` — L22, L30
- `src/services/admin-service/internal/model/schema/validation_rules_json_schema.go` · `NormalizeValidationRulesJSON` — L45
- `src/services/admin-service/internal/model/schema/validation_rules_json_schema.go` · `ParseValidationRulesJSON` — L61, L66, L73
- `src/services/admin-service/internal/pkg/jobscheduler/executor.go` · `*Executor.executeHTTP` — L160, L170, L190
- `src/services/admin-service/internal/pkg/jobscheduler/scheduler.go` · `*Scheduler.RunNow` — L108
- `src/services/admin-service/internal/pkg/jobscheduler/scheduler.go` · `*Scheduler.registerFixedDelay` — L209
- `src/services/admin-service/internal/pkg/jobscheduler/scheduler.go` · `*Scheduler.registerFixedRate` — L172
- `src/services/admin-service/internal/repository/admin_system_log_repo.go` · `*adminSystemLogRepository.GetByID` — L36
- `src/services/admin-service/internal/repository/admin_system_log_repo.go` · `*adminSystemLogRepository.Search` — L63, L82
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.CountList` — L309
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.FindByID` — L183
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.FindByIDBanGhiAndMaForUpdate` — L470
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.FindByIDForUpdate` — L217
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.FindList` — L269
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.GetTableColumnTypes` — L562, L573
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.Import` — L528
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.InsertBatch` — L600
- `src/services/admin-service/internal/repository/category/category_data_repository.go` · `*categoryDataRepo.NextDataID` — L425
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.CountList` — L248
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.Create` — L96
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.ExistsByCodeOrTableName` — L361
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.ExistsByMaOrTableName` — L125
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.FindByID` — L152
- `src/services/admin-service/internal/repository/category/category_group_repo.go` · `*categoryGroupRepo.FindList` — L204
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.CountWithFilter` — L191
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.ExistsByCode` — L203
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.GetAll` — L116
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.GetByID` — L104
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.List` — L131
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.ListWithFilter` — L164
- `src/services/admin-service/internal/repository/connected_system_repo.go` · `*connectedSystemRepository.NextCode` — L83
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetActiveFlowPaths` — L970
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetHourlyFetched` — L372
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetHourlyThroughput` — L298
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetLatestTopics` — L454
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetRecordsByTopic` — L414
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetSummary` — L202
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTopFailed` — L491
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTopicsToday` — L324
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTotalTopics` — L334
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTotalTopicsPrevMonth` — L345
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrend7Days` — L256
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendByDays` — L617
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendLast24Hours` — L575
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendLastHour` — L535
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendLastYear` — L657
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendMonthly` — L755
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetTrendWeekly` — L706
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetWarehouseLatestFlows` — L911
- `src/services/admin-service/internal/repository/dashboard_repo.go` · `*dashboardRepo.GetWarehouseSummary` — L794
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.Count` — L192
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.CountVersionsBySourceID` — L202
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.EndpointBelongsToSystem` — L306
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ExistsActiveBySchemaSubjectID` — L279
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ExistsByCode` — L228
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ExistsByFingerprint` — L244
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ExistsByKey` — L212
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ExistsBySchemaSubjectID` — L261
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.GetByCode` — L168
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.GetByID` — L156
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.List` — L183
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.ListVersionsBySourceID` — L125
- `src/services/admin-service/internal/repository/data_sharing_config.go` · `*dataSharingConfigRepository.MaxCodeSuffix` — L295
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.CountAbandonedCodes` — L244
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.CountCodes` — L215
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.CountGroups` — L137
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.ExistsCodeByCode` — L272
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.ExistsGroupByCode` — L260
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.GetCodeByID` — L157
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.GetGroupByID` — L63
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.ListAbandonedCodes` — L230
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.ListCodes` — L188
- `src/services/admin-service/internal/repository/error_code_repo.go` · `*errorCodeRepository.ListGroups` — L104
- `src/services/admin-service/internal/repository/flink_repository.go` · `*flinkRepository.GetAllJobs` — L53
- `src/services/admin-service/internal/repository/flink_repository.go` · `*flinkRepository.GetExecutionByID` — L82
- `src/services/admin-service/internal/repository/flink_repository.go` · `*flinkRepository.GetJobByID` — L45
- `src/services/admin-service/internal/repository/flink_repository.go` · `*flinkRepository.GetParamsByJobID` — L71
- `src/services/admin-service/internal/repository/history_repo.go` · `*HistoryRepo.FindByConfigID` — L28
- `src/services/admin-service/internal/repository/history_repo.go` · `*HistoryRepo.FindLatestByConfigID` — L40
- `src/services/admin-service/internal/repository/history_repo.go` · `*HistoryRepo.FindPreviousByConfigID` — L52
- `src/services/admin-service/internal/repository/history_repo.go` · `*HistoryRepo.NextVersion` — L65
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.CountResults` — L207
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.CountWithFilter` — L140
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.Delete` — L149
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.GetByID` — L61
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.GetFirstByModule` — L80
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.List` — L100
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.ListEnabled` — L90
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.ListResults` — L199
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.ListWithFilter` — L134
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.ReplacePayloadHeaders` — L157
- `src/services/admin-service/internal/repository/job_repo.go` · `*jobRepository.ReplacePayloadQueries` — L167
- `src/services/admin-service/internal/repository/job_run_log_repo.go` · `*jobRunLogRepo.FindByTraceID` — L32
- `src/services/admin-service/internal/repository/kafka_topic_repo.go` · `*kafkaTopicRepository.GetAll` — L29
- `src/services/admin-service/internal/repository/kafka_topic_repo.go` · `*kafkaTopicRepository.GetByName` — L35
- `src/services/admin-service/internal/repository/kong_auth_repo.go` · `*KongAuthRepo.FindRoutePluginByConfigAndName` — L50
- `src/services/admin-service/internal/repository/kong_auth_repo.go` · `*KongAuthRepo.GetConsumerByUsername` — L31
- `src/services/admin-service/internal/repository/nguoi_dan_repo.go` · `*nguoiDanRepository.GetAll` — L41
- `src/services/admin-service/internal/repository/nguoi_dan_repo.go` · `*nguoiDanRepository.GetByID` — L33
- `src/services/admin-service/internal/repository/nifi_template_repo.go` · `*nifiTemplateRepository.FindBySchemaCode` — L46
- `src/services/admin-service/internal/repository/pull_errors_repo.go` · `*pullErrorRepo.ListAll` — L51
- `src/services/admin-service/internal/repository/pull_errors_repo.go` · `*pullErrorRepo.ListPending` — L41
- `src/services/admin-service/internal/repository/pull_history_repo.go` · `*pullHistoryRepo.GetCurrent` — L64
- `src/services/admin-service/internal/repository/pull_history_repo.go` · `*pullHistoryRepo.LoadOrCreate` — L42
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.CountPermissionGroupsByIDs` — L593
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.CountPermissionsByIDs` — L584
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.CreatePermissionGroup` — L262
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.DeletePermissionGroup` — L280, L283
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetPermissionByCode` — L232
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetPermissionGroupByCode` — L246
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetPermissionGroupByID` — L254
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetPermissionsByIDs` — L607
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetUserDirectPermissions` — L338
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetUserPermissionCodes` — L393
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetUserPermissionGroups` — L300
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.GetUserPermissions` — L387
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.HasUserPermission` — L420
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.ListPermissionGroups` — L240
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.ListPermissionGroupsByPermissionID` — L555, L567
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.ListPermissions` — L226
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.ListRbacModules` — L575
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.ListUsersByPermissionID` — L531, L542
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.SearchPermissionGroups` — L502, L515
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.SearchPermissions` — L451, L470
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.SeedCatalog` — L118, L123, L135, L140, L180, L191, L194
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.SetUserPermissionGroups` — L306
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.SetUserPermissions` — L344
- `src/services/admin-service/internal/repository/rbac_repo.go` · `*rbacRepository.UpdatePermissionGroup` — L271
- `src/services/admin-service/internal/repository/rbac_repo.go` · `replacePermissionGroupPermissions` — L205
- `src/services/admin-service/internal/repository/route_config_repo.go` · `*RouteConfigRepo.FindAll` — L42
- `src/services/admin-service/internal/repository/route_config_repo.go` · `*RouteConfigRepo.FindByID` — L25
- `src/services/admin-service/internal/repository/route_config_repo.go` · `*RouteConfigRepo.FindByRoutePath` — L33
- `src/services/admin-service/internal/repository/route_repo.go` · `*routeRepository.GetAll` — L32
- `src/services/admin-service/internal/repository/route_repo.go` · `*routeRepository.GetAllActive` — L38
- `src/services/admin-service/internal/repository/route_repo.go` · `*routeRepository.GetByID` — L44
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.Count` — L128
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.CountAllData` — L196
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.ExistsByCode` — L213
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.GetByID` — L85
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.List` — L117
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.ListAllData` — L188
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.ListApproved` — L155
- `src/services/admin-service/internal/repository/schema_subject_repo.go` · `*schemaSubjectRepository.ListByConnectedSystem` — L143
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.FindByID` — L90
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.FindFirstActiveByRegistryCode` — L146, L154
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.FindLatestActiveByRegistryCode` — L114, L122
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.MaxSubjectSchemaVersion` — L185
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.RegistryCodeForVersion` — L170
- `src/services/admin-service/internal/repository/schema_version_repo.go` · `*schemaVersionRepo.UpsertForRegistryCode` — L68
- `src/services/admin-service/internal/repository/sync_history.go` · `*syncHistoryRepository.Count` — L91
- `src/services/admin-service/internal/repository/sync_history.go` · `*syncHistoryRepository.CountWithFilter` — L97
- `src/services/admin-service/internal/repository/sync_history.go` · `*syncHistoryRepository.GetByID` — L50
- `src/services/admin-service/internal/repository/sync_history.go` · `*syncHistoryRepository.List` — L62
- `src/services/admin-service/internal/repository/sync_history.go` · `*syncHistoryRepository.ListWithFilter` — L85
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.Count` — L113
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.CountWithFilter` — L119
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.GetByEmail` — L63, L65
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.GetByID` — L54
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.List` — L77
- `src/services/admin-service/internal/repository/user_repo.go` · `*userRepository.ListWithFilter` — L107
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go` · `fillCategoryDataImportDefaults` — L497, L508, L516, L531
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go` · `findCategoryDataExcelLayout` — L64
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_flatten_helper.go` · `flattenCategoryDataRequestItem` — L25, L33, L44, L52
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.CreateCategoryData` — L60, L65, L91, L101, L109, L114, L124
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.DeleteCategoryData` — L359, L370, L387, L395
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.GetDetailCategoryData` — L196, L201
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.GetListCategoryData` — L143, L157, L167
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.ImportCategoryData` — L550, L571, L600, L605
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.UpdateCategoryData` — L243, L248, L258, L277, L301, L315, L320, L332
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go` · `*categoryDataServiceImpl.getActiveCategoryGroup` — L410
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_validator.go` · `validateValueByConfig` — L187, L191
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.CreateCategoryGroup` — L74, L102, L106, L115, L152, L162, L169
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.DeleteCategoryGroups` — L556
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.GetDetailCategoryGroup` — L367
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.GetListCategoryGroup` — L273, L288, L299
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.ImportCategories` — L584, L589
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `*categoryGroupImpl.UpdateCategoryGroup` — L427, L432, L459, L493, L500, L505
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `parseTruongBoSungRequestJSON` — L819
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go` · `tableHasData` — L833, L848
- `src/services/admin-service/internal/service/danh-muc/category-group/import_excel_helper.go` · `findCategoryExcelLayout` — L35
- `src/services/admin-service/internal/service/danh-muc/dynamic_table_service.go` · `*dynamicTableServiceImpl.CreateCategoryTables` — L54, L61, L65
- `src/services/admin-service/internal/service/danh-muc/dynamic_table_service.go` · `*dynamicTableServiceImpl.createCategoryDataTable` — L78, L98
- `src/services/admin-service/internal/service/danh-muc/dynamic_table_service.go` · `*dynamicTableServiceImpl.createCategoryLogTable` — L163
- `src/services/admin-service/internal/service/danh-muc/sync/sync_impl.go` · `*categorySyncServiceImpl.SyncDataFromKhoMo` — L59, L81
- `src/services/admin-service/internal/service/dashboard_service.go` · `*dashboardService.GetSummary` — L53, L57, L66
- `src/services/admin-service/internal/service/data-sharing-config/endpoint_whitelist.go` · `endpointAllowIPs` — L90
- `src/services/admin-service/internal/service/data-sharing-config/endpoint_whitelist.go` · `endpointsAllowIPs` — L75
- `src/services/admin-service/internal/service/data-sharing-config/endpoint_whitelist.go` · `hostFromOriginURL` — L106
- `src/services/admin-service/internal/service/data-sharing-config/endpoint_whitelist.go` · `originURLToAllowIPs` — L98
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.Approve` — L1151
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.Create` — L917, L927, L936, L948, L954, L964, L1017, L1023
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.Delete` — L1797, L1800, L1803, L1806
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.DeleteMany` — L1835
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.GetByID` — L1600, L1604, L1609
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.List` — L1636, L1653, L1657
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.Revoke` — L1570, L1575
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.Update` — L1045, L1073, L1100, L1104, L1109, L1117, L1142
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.activateCollectionJobOnApprove` — L1528, L1532
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.buildConfigFromCreate` — L500, L504, L509, L544
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.changeStatus` — L416, L441, L447
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.deletePartnerResourcesOnDelete` — L1691, L1696
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.ensureCollectionCronJob` — L1389, L1393
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.failApproveWithPersist` — L793, L806
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.generateCode` — L578, L584, L590, L610
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.marshalCollectionJobBody` — L1304
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.provisionPartnerRoute` — L691, L696
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.runCollectionJobOnApprove` — L1500, L1505
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.updateCollectionJobOnApprove` — L1462, L1467
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.updatePartnerRouteOnApprove` — L817
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.validateReferences` — L227, L233, L239, L249, L261, L271
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `*dataSharingConfigService.validateSchemaSubjectNotInUse` — L286
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `jsonEqual` — L196, L200
- `src/services/admin-service/internal/service/data-sharing-config/service.go` · `normalizeJSONForCompare` — L188
- `src/services/admin-service/internal/service/data-sharing-config/sharing_route_body.go` · `endpointSourceIP` — L62, L66
- `src/services/admin-service/internal/service/data-sharing-config/source_endpoint.go` · `buildUpstreamURL` — L73, L91
- `src/services/admin-service/internal/service/data-sharing-config/source_endpoint.go` · `paramsPayloadToURLValues` — L147
- `src/services/admin-service/internal/service/data-sharing-config/source_endpoint.go` · `queryParamsForKongRoute` — L171
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_cleanup.go` · `*dataSharingConfigService.deleteWarehouseOnConfigDelete` — L128
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go` · `*dataSharingConfigService.fetchCheckingSchemaJSON` — L649
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go` · `*dataSharingConfigService.provisionWarehouseOnApprove` — L115, L135, L147, L159, L175, L182, L189, L199, L207, L215, L226
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go` · `*dataSharingConfigService.resolveNifiJSONSchema` — L699
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.CreateDataSource` — L47
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.DeleteDataSource` — L237
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.GetActiveDataSources` — L253
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.GetDataSourceByID` — L110
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.GetDataSourceByName` — L119
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.ListDataSources` — L128
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.UpdateDataSource` — L137, L178
- `src/services/admin-service/internal/service/data_source_service.go` · `*dataSourceService.validateCreateRequest` — L269
- `src/services/admin-service/internal/service/flink_service.go` · `*flinkService.GetExecutionStats` — L301
- `src/services/admin-service/internal/service/flink_service.go` · `*flinkService.GetJobStats` — L310
- `src/services/admin-service/internal/service/flink_status_poller.go` · `*FlinkStatusPoller.fetchFlinkJobState` — L133, L143, L149
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.Create` — L50, L95
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.Delete` — L269
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.List` — L224, L228
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.ListResults` — L286, L290
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.RunNow` — L277
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.Update` — L140, L175, L200
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.UpsertUsersJob` — L113, L118, L124
- `src/services/admin-service/internal/service/job/job_service.go` · `*jobService.setEnabled` — L248, L254
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.DeleteTopic` — L384
- `src/services/admin-service/internal/service/kafka_monitor_svc.go` · `*kafkaMonitorSvc.GetClusterHealth` — L350
- `src/services/admin-service/internal/service/kafka_service.go` · `*kafkaService.CreateTopic` — L67, L76, L82, L86, L112
- `src/services/admin-service/internal/service/kafka_service.go` · `*kafkaService.ListTopics` — L122, L128
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.AddPluginToRoute` — L198
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.AssignConsumerACLGroup` — L219
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.CreateConsumer` — L85
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.CreateConsumerKey` — L123, L143
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.SyncPreFunctionBody` — L273
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.SyncRequestTransformer` — L241
- `src/services/admin-service/internal/service/kong_auth_svc.go` · `*KongAuthService.createConsumerKeyWithRetry` — L318
- `src/services/admin-service/internal/service/kong_client.go` · `*KongClient.do` — L348
- `src/services/admin-service/internal/service/nguoi_dan_service.go` · `*nguoiDanService.Create` — L35
- `src/services/admin-service/internal/service/nguoi_dan_service.go` · `*nguoiDanService.GetAll` — L59, L64
- `src/services/admin-service/internal/service/nguoi_dan_service.go` · `*nguoiDanService.GetByID` — L45, L50
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.AssignGroupPermissions` — L359, L363, L366
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.AssignUserPermissionGroups` — L333, L337, L340
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.AssignUserPermissions` — L310, L314, L317
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.CreatePermissionGroup` — L396, L414
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.DeleteManyPermissionGroups` — L499
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.DeletePermissionGroup` — L481
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.GetPermissionGroup` — L466
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ListGroupsForPermission` — L286
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ListUsersForPermission` — L254
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.Search` — L131, L136
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.SearchPermissionGroups` — L221
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.UpdatePermissionGroup` — L431, L447, L450
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ensureCreatePermissionHasReadPermission` — L515
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ensurePermissionGroupIDsExist` — L80
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ensurePermissionIDsExist` — L66
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go` · `*PermissionService.ensureUserExists` — L55
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go` · `*errorCodeService.ExportErrorCodeGroupsExcel` — L170, L176, L181, L187, L190, L195
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go` · `*errorCodeService.ExportErrorCodesExcel` — L62, L68, L73, L79, L82, L87
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go` · `*errorCodeService.ImportErrorCodeGroupsExcel` — L204, L217
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go` · `*errorCodeService.ImportErrorCodesExcel` — L96, L109, L136, L140
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go` · `nextGeneratedImportErrorCode` — L28
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.CreateCode` — L323
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.CreateGroup` — L152, L156, L161, L167, L171
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.DeleteManyCodes` — L411, L414
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.DeleteManyGroups` — L266, L270, L279
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.InactivateCode` — L427
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.InactivateGroup` — L292
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.UpdateCode` — L341, L363
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `*errorCodeService.UpdateGroup` — L190, L202, L210
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `nextGeneratedErrorCodeGroupCode` — L89
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go` · `wrapUniqueCodeViolation` — L75
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/sync_history.go` · `*syncHistoryService.Create` — L38
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/sync_history.go` · `*syncHistoryService.List` — L68, L72
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/sync_history.go` · `*syncHistoryService.ListWithFilter` — L81, L87, L91
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go` · `*userService.GetByID` — L91
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go` · `*userService.List` — L66, L70
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go` · `*userService.Search` — L78, L82
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go` · `*userService.SyncUser` — L122
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go` · `*userService.fetchAndSaveSSOUsers` — L134
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go` · `*connectedSystemService.Create` — L99
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go` · `*connectedSystemService.Delete` — L255
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go` · `*connectedSystemService.DeleteMany` — L300
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go` · `*connectedSystemService.Inactivate` — L313
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go` · `*connectedSystemService.Update` — L116, L218, L223
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.DeleteRouteConfig` — L398
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.GetRouteConfig` — L284
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.GetRouteConfigByRoutePath` — L237
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.RollbackRouteConfig` — L426
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.SetRouteEnabledByPath` — L258
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.UpdateRouteConfig` — L301
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.UpdateRouteMethods` — L347
- `src/services/admin-service/internal/service/route_config_svc.go` · `*RouteConfigService.createRouteConfig` — L186
- `src/services/admin-service/internal/service/route_service.go` · `*routeService.CreateRoute` — L35
- `src/services/admin-service/internal/service/route_service.go` · `*routeService.DeleteRoute` — L92
- `src/services/admin-service/internal/service/route_service.go` · `*routeService.UpdateRoute` — L70
- `src/services/admin-service/internal/service/schema-registry/json_schema_excel_export.go` · `*schemaRegistryService.ExportExcelFromJsonSchema` — L39, L42
- `src/services/admin-service/internal/service/schema-registry/json_schema_excel_export.go` · `buildSchemaExcelFromParsedFields` — L84, L91, L117, L120, L125, L132, L140, L145, L148, L153, L158, L161, L166
- `src/services/admin-service/internal/service/schema-registry/json_schema_excel_export.go` · `validateParsedFieldsForExcelExport` — L73
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.ImportSchema` — L122
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.InactivateSchema` — L931
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.RegisterFromValidationRules` — L229, L240
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.checkSyncInProgress` — L857, L862, L876
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.generateAvroSchema` — L497
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.invalidateIngestCache` — L830, L836
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.parseXLSX` — L274, L281, L291, L379
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.resolveNifiXML` — L980
- `src/services/admin-service/internal/service/schema-registry/service.go` · `*schemaRegistryService.setCompatibilityNone` — L682, L692
- `src/services/admin-service/internal/service/schema-registry/service.go` · `validateArraysHaveChildren` — L467
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.Create` — L83, L107, L173
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.Delete` — L381, L390
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.DeleteMany` — L420, L429
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.GetAllApproved` — L353
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.GetAllData` — L362, L366
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.GetAllWithConnectedSystem` — L344
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.List` — L329, L333
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.Update` — L190, L207, L233, L260, L306
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.UpdateActiveVersion` — L455
- `src/services/admin-service/internal/service/schema-wrapper/service.go` · `*schemaWrapperService.resolveNifiXML` — L484
- `src/services/admin-service/internal/service/sso/sso_service.go` · `*directAuthService.ParseInternalJWT` — L505
- `src/services/admin-service/internal/service/sso/sso_service.go` · `*directAuthService.getUserGroupsByCCCD` — L525
- `src/services/admin-service/internal/service/sso/sso_service.go` · `*directAuthService.getUserModulesAndPermissionsByGroups` — L578
- `src/services/admin-service/internal/service/vault_service.go` · `*vaultService.DecryptSlice` — L124, L141
- `src/services/admin-service/internal/service/vault_service.go` · `*vaultService.DecryptStruct` — L83, L96
- `src/services/admin-service/internal/service/vault_service.go` · `*vaultService.EncryptStruct` — L57, L70
- `src/services/admin-service/pkg/kong/kong_client.go` · `*Client.do` — L138
- `src/services/admin-service/pkg/logger/logger.go` · `Init` — L45
- `src/services/admin-service/pkg/logger/logger.go` · `buildOtelProvider` — L79, L85, L95
- `src/services/admin-service/pkg/tracer/tracer.go` · `Init` — L31, L37
- `src/services/admin-service/pkg/vault/vault_client.go` · `NewVaultClient` — L58
- `src/services/audit-service/cmd/server/main.go` · `main` — L110
- `src/services/audit-service/internal/repository/access_log_repository.go` · `*AccessLogRepository.Query` — L72, L86
- `src/services/audit-service/internal/service/access_log_service.go` · `*AccessLogService.Query` — L176
- `src/services/audit-service/internal/service/access_log_service.go` · `*AccessLogService.Save` — L145
- `src/services/audit-service/pkg/logger/logger.go` · `Init` — L45
- `src/services/audit-service/pkg/logger/logger.go` · `buildOtelProvider` — L80, L86, L96
- `src/services/audit-service/pkg/tracer/tracer.go` · `Init` — L31, L37
- `src/services/file-downloader-service/internal/downloader/http.go` · `*HTTPDownloader.doGetToken` — L105
- `src/services/file-downloader-service/internal/uploader/ozone.go` · `New` — L38
- `src/services/file-downloader-service/internal/worker/worker.go` · `*Worker.process` — L196
- `src/services/file-downloader-service/internal/worker/worker.go` · `*checksumReader.Read` — L419
- `src/services/file-downloader-service/pkg/logger/logger.go` · `Init` — L38
- `src/services/file-downloader-service/pkg/logger/logger.go` · `buildOtelProvider` — L70, L76, L84
- `src/services/file-downloader-service/pkg/tracer/tracer.go` · `Init` — L31, L37
- `src/services/integration-service/internal/core/pipeline/delta_filter.go` · `*DeltaFilter.DeleteKeysByPrefix` — L164
- `src/services/integration-service/internal/core/pipeline/delta_filter.go` · `*DeltaFilter.GetVersions` — L144
- `src/services/integration-service/internal/core/pipeline/delta_filter.go` · `*DeltaFilter.ProcessBatch` — L48
- `src/services/integration-service/internal/core/pipeline/sync_engine.go` · `*SyncEngine.Run` — L142, L187
- `src/services/integration-service/internal/core/pipeline/sync_engine.go` · `*SyncEngine.processRecords` — L384, L439
- `src/services/integration-service/internal/handler/datasource_handler.go` · `parseUint` — L98
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_001` — L369
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_002` — L378
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_003` — L387
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_004` — L396
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_005` — L405
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_006` — L414
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_007` — L423
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_008` — L432
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_009` — L441
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_010` — L450
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_011` — L459
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_012` — L468
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_013` — L477
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_014` — L486
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_015` — L495
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_016` — L504
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_017` — L513
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_018` — L522
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_019` — L531
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_020` — L540
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_021` — L549
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_022` — L558
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_023` — L567
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_024` — L576
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_025` — L585
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_026` — L594
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_027` — L603
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_028` — L612
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_029` — L621
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_030` — L630
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_031` — L639
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_032` — L648
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_033` — L657
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_034` — L666
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_035` — L675
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_036` — L684
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_037` — L693
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_038` — L702
- `src/services/integration-service/internal/provider/bct/adapter.go` · `*Adapter.fetchG02_039` — L711
- `src/services/integration-service/internal/provider/bct/client.go` · `fetchList` — L289, L347
- `src/services/integration-service/internal/provider/bhxh/adapter.go` · `*Adapter.fetchG24_001` — L64
- `src/services/integration-service/internal/provider/bhxh/client.go` · `fetchList` — L95, L153
- `src/services/integration-service/internal/provider/cdlqg/adapter.go` · `*Adapter.FetchPage` — L51
- `src/services/integration-service/internal/provider/cdlqg/client.go` · `*Client.FetchDetailRaw` — L207, L270
- `src/services/integration-service/internal/provider/cdlqg/client.go` · `*Client.FetchPage` — L95, L158
- `src/services/integration-service/internal/provider/cdlqg/model.go` · `*MoTaTrangThai.UnmarshalJSON` — L103, L114
- `src/services/integration-service/internal/repository/job_repo.go` · `*jobRepo.ListByDatasource` — L39
- `src/services/integration-service/internal/repository/pull_errors_repo.go` · `*pullErrorRepo.ListAll` — L51
- `src/services/integration-service/internal/repository/pull_errors_repo.go` · `*pullErrorRepo.ListPending` — L41
- `src/services/integration-service/internal/repository/pull_history_repo.go` · `*pullHistoryRepo.GetCurrent` — L104
- `src/services/integration-service/internal/repository/pull_history_repo.go` · `*pullHistoryRepo.LoadOrCreate` — L45
- `src/services/integration-service/internal/repository/schema_metadata_repo.go` · `*schemaMetadataRepo.FindActiveBySubject` — L41
- `src/services/integration-service/internal/service/datasource_service.go` · `*datasourceSvc.Update` — L44
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.Push` — L116, L130
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.Run` — L57, L71, L84
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.fetchRecords` — L171, L179, L189
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.fetchRecordsWithSpan` — L149
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.publishToKafka` — L205
- `src/services/integration-service/internal/service/ingest_service.go` · `*ingestSvc.publishToKafkaWithSpan` — L165
- `src/services/integration-service/internal/service/job_service.go` · `*jobSvc.Push` — L41, L54, L59
- `src/services/integration-service/internal/service/job_service.go` · `*jobSvc.Trigger` — L67, L75
- `src/services/integration-service/internal/service/schema_validator.go` · `*schemaValidatorSvc.Validate` — L147, L156
- `src/services/integration-service/internal/service/schema_validator.go` · `*schemaValidatorSvc.walkAndValidate` — L225
- `src/services/integration-service/pkg/logger/logger.go` · `Init` — L45
- `src/services/integration-service/pkg/logger/logger.go` · `buildOtelProvider` — L80, L86, L96
- `src/services/integration-service/pkg/meter/meter.go` · `Init` — L29, L35
- `src/services/integration-service/pkg/tracer/tracer.go` · `Init` — L31, L37
- `src/services/mock_datasource/internal/faker/schema_parser.go` · `ParseSchemaCSV` — L33, L42
- `src/services/mock_datasource/internal/repository/record_repo.go` · `*recordRepo.CountByLoai` — L145
- `src/services/mock_datasource/internal/repository/record_repo.go` · `*recordRepo.ListSchemas` — L155
- `src/services/mock_datasource/internal/repository/record_repo.go` · `*recordRepo.Search` — L99, L122
- `src/services/mock_datasource/internal/service/gen_service.go` · `WalkCSVFiles` — L194, L201
- `src/services/sharing-service/internal/client/hive.go` · `*HiveClient.ListRows` — L163
- `src/services/sharing-service/internal/client/hive.go` · `*HiveClient.withRetry` — L85
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.executeQuery` — L402
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.fetchResultData` — L460
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.fetchResultDataWithMeta` — L280
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.getCSRF` — L326
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.login` — L354
- `src/services/sharing-service/internal/client/hue.go` · `*HueClient.postForm` — L579, L593
- `src/services/sharing-service/internal/repository/access_log_repo.go` · `*postgresAccessLogRepo.GetFlowRanking` — L136
- `src/services/sharing-service/internal/repository/access_log_repo.go` · `*postgresAccessLogRepo.GetLatestFlows` — L105
- `src/services/sharing-service/internal/repository/access_log_repo.go` · `*postgresAccessLogRepo.GetSummary` — L63, L76
- `tools/convention-scan/internal/checks/ast_helpers.go` · `parseGoFile` — L14, L19
- `tools/convention-scan/internal/checks/runner.go` · `runGoChecks` — L36
- `tools/convention-scan/main.go` · `readPathsFrom` — L90

### Dockerfile thiếu USER (chạy bằng root) — 16

- **Lỗi cụ thể:** Container chạy bằng root → rủi ro bảo mật khi bị thoát container.
- **Hướng khắc phục:** Thêm: RUN addgroup -S app && adduser -S app -G app  /  USER app

**Vị trí:**

- `deploy/docker/admin-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/audit-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/debug/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/file-downloader-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/integration-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/masking-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/mock-datasource/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/monitoring-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/sharing-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/admin-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/audit-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/file-downloader-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/integration-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/masking-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/mock_datasource/Dockerfile` · `<dockerfile>` — L1
- `src/services/monitoring-service/Dockerfile` · `<dockerfile>` — L1


## 🟡 MEDIUM — 439 vi phạm

### Dùng gin.H{} trực tiếp — 290

- **Lỗi cụ thể:** Trả response bằng gin.H{} thủ công → không nhất quán envelope (code/message/data).
- **Hướng khắc phục:** Dùng pkg/httputil/response.go (standard envelope: code/message/data)

**Vị trí:**

- `src/services/admin-service/internal/handler/admin_system_log_handler.go` · `*AdminSystemLogHandler.GetByID` — L121, L127
- `src/services/admin-service/internal/handler/admin_system_log_handler.go` · `*AdminSystemLogHandler.Search` — L62, L80
- `src/services/admin-service/internal/handler/audit_log_handler.go` · `*AuditLogHandler.GetAll` — L29
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.Create` — L62
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.CreateData` — L245
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.Delete` — L206
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.DeleteData` — L327
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.GetDataDetail` — L400
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.GetDetailData` — L131
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.GetList` — L100
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.GetListData` — L366
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.ImportCategories` — L503
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.ImportCategoryData` — L524, L532, L539, L546, L554, L562, L578, L584
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.SyncDataFromKhoMo` — L439
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.Update` — L171
- `src/services/admin-service/internal/handler/danh-muc/handler.go` · `*GroupCategoryHandler.UpdateData` — L288
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetActiveFlowPaths` — L275
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetDataSharingFlowRanking` — L382
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetDataSharingLatestFlows` — L365
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetDataSharingSummary` — L349
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetHourlyFetched` — L202
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetHourlyThroughput` — L183
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetLatestTopics` — L246
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetRecordsByTopic` — L222
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetSummary` — L67
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetTopFailed` — L404
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetTrend7Days` — L92, L102, L112, L122, L132, L142, L152, L163
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseFlowRanking` — L302
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseLatestFlows` — L318
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseProcessingStatus` — L328
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseRecordStats` — L338
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseRecordTrend` — L286
- `src/services/admin-service/internal/handler/dashboard_handler.go` · `*DashboardHandler.GetWarehouseSummary` — L265
- `src/services/admin-service/internal/handler/data-sharing-config/handler.go` · `*DataSharingConfigHandler.GenKey` — L351
- `src/services/admin-service/internal/handler/data-sharing-config/handler.go` · `*DataSharingConfigHandler.List` — L233
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.CreateDataSource` — L25, L32
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.DeleteDataSource` — L111, L115
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.GetDataSourceByID` — L63
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.GetDataSourceByName` — L77
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.ListDataSources` — L44
- `src/services/admin-service/internal/handler/data_source_handler.go` · `*DataSourceHandler.UpdateDataSource` — L90, L97
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.CancelExecution` — L342, L345
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.CancelWithSavepoint` — L362
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetExecution` — L382
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetExecutionStats` — L61
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetJob` — L221
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetJobExecutions` — L307
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.GetJobStats` — L80
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.ListJobs` — L176
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.SubmitJob` — L261, L273
- `src/services/admin-service/internal/handler/flink_handler.go` · `*FlinkHandler.UploadJar` — L105, L111, L118, L126, L135, L144, L152, L156
- `src/services/admin-service/internal/handler/health.go` · `HealthCheck` — L10
- `src/services/admin-service/internal/handler/job/handler.go` · `*JobHandler.List` — L242
- `src/services/admin-service/internal/handler/job/handler.go` · `*JobHandler.ListResults` — L384
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.CreateTopic` — L37, L41
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.DeleteTopic` — L99
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.GetBrokers` — L278
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.GetClusterHealth` — L287
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.GetConsumerGroupLag` — L233
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.GetTopicDetail` — L83
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.GetTopicOffsets` — L154
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.ListConsumerGroups` — L216
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.ListTopics` — L64
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.PeekMessages` — L194, L197
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.ResetConsumerGroupOffset` — L257, L262, L272
- `src/services/admin-service/internal/handler/kafka_handler.go` · `*KafkaHandler.UpdateTopicConfig` — L126, L130, L140
- `src/services/admin-service/internal/handler/kho-mo-sync/handler.go` · `*Handler.Sync` — L92, L100
- `src/services/admin-service/internal/handler/kong_auth_handler.go` · `*KongAuthHandler.AddPluginToRoute` — L95, L101, L107
- `src/services/admin-service/internal/handler/kong_auth_handler.go` · `*KongAuthHandler.CreateConsumer` — L33, L39
- `src/services/admin-service/internal/handler/kong_auth_handler.go` · `*KongAuthHandler.CreateConsumerKey` — L61, L67, L73
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.Create` — L26, L34
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.Delete` — L104, L112
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.GetAll` — L67
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.GetAllEncrypt` — L147
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.GetByID` — L45, L54
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.GetByIDEncrypt` — L124, L133
- `src/services/admin-service/internal/handler/nguoi_dan_handler.go` · `*NguoiDanHandler.Update` — L78, L84, L93
- `src/services/admin-service/internal/handler/partner_route_handler.go` · `*PartnerRouteHandler.Create` — L38, L45, L48
- `src/services/admin-service/internal/handler/phan-quyen/handler.go` · `*PermissionHandler.ListGroupPermissions` — L122
- `src/services/admin-service/internal/handler/phan-quyen/handler.go` · `*PermissionHandler.ListUsers` — L91
- `src/services/admin-service/internal/handler/phan-quyen/handler.go` · `*PermissionHandler.Search` — L57
- `src/services/admin-service/internal/handler/phan-quyen/handler.go` · `*PermissionHandler.SearchPermissionGroups` — L276
- `src/services/admin-service/internal/handler/quan-ly-ma-loi/handler.go` · `*ErrorCodeHandler.GetListAbandoned` — L250
- `src/services/admin-service/internal/handler/quan-ly-ma-loi/handler.go` · `*ErrorCodeHandler.SearchCodes` — L270
- `src/services/admin-service/internal/handler/quan-ly-ma-loi/handler.go` · `*ErrorCodeHandler.SearchGroups` — L148
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.List` — L187
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.Search` — L134
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.SearchSyncHistory` — L215
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.SyncAuto` — L106
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.SyncManual` — L83
- `src/services/admin-service/internal/handler/quan-ly-nguoi-dung/handler.go` · `*UserHandler.parseSyncManualUserID` — L248, L253
- `src/services/admin-service/internal/handler/quan-tri-phan-mem/handler.go` · `*ConnectedSystemHandler.List` — L257
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Create` — L39, L46, L49
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.CreateKongOnly` — L79, L86, L89
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Delete` — L212, L220, L223, L235
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Get` — L133, L140, L143
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.History` — L279, L285
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.List` — L114
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Rollback` — L250, L257, L260
- `src/services/admin-service/internal/handler/route_config_handler.go` · `*RouteConfigHandler.Update` — L165, L173, L180, L183
- `src/services/admin-service/internal/handler/route_handler.go` · `*RouteHandler.GetAllRoutes` — L26
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.CheckHealth` — L492, L499
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.DeleteSchema` — L511, L514, L526
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.GetAvroSchema` — L539, L542, L546
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.GetLatestSchema` — L479, L482
- `src/services/admin-service/internal/handler/schema-registry/handler.go` · `*SchemaHandler.RegisterSchema` — L326, L333, L339, L345, L352, L359, L366
- `src/services/admin-service/internal/handler/schema-wrapper/handler.go` · `*SchemaWrapperHandler.GetAllData` — L316
- `src/services/admin-service/internal/handler/schema-wrapper/handler.go` · `*SchemaWrapperHandler.List` — L149
- `src/services/admin-service/internal/handler/sso/sso_handler.go` · `*SSOHandler.Login` — L27, L33
- `src/services/admin-service/internal/handler/sso/sso_handler.go` · `*SSOHandler.Logout` — L68, L75, L81, L86, L90
- `src/services/admin-service/internal/handler/sso/sso_handler.go` · `*SSOHandler.Refresh` — L42, L49, L54, L59
- `src/services/admin-service/internal/handler/ttdl/handler.go` · `*Handler.CreateJobThuThapDuLieu` — L113, L120
- `src/services/admin-service/internal/handler/vault_handler.go` · `*VaultHandler.Decrypt` — L59, L64, L69, L78, L82
- `src/services/admin-service/internal/handler/vault_handler.go` · `*VaultHandler.Encrypt` — L31, L36, L45, L49
- `src/services/admin-service/internal/handler/vault_handler.go` · `*VaultHandler.GetClientToken` — L90, L93
- `src/services/admin-service/internal/middleware/auth.go` · `AuthMiddleware` — L17, L23, L38, L45, L54, L66
- `src/services/admin-service/internal/middleware/permission_middleware.go` · `PermissionMiddleware` — L30, L40, L50, L60, L70, L86, L95
- `src/services/admin-service/internal/utils/bizerr.go` · `Write` — L102, L104
- `src/services/audit-service/cmd/server/main.go` · `main` — L82
- `src/services/audit-service/internal/handler/access_log_handler.go` · `*AccessLogHandler.Query` — L36, L51
- `src/services/audit-service/internal/handler/signoz_handler.go` · `*SignozHandler.QueryLogs` — L51, L72, L78
- `src/services/audit-service/internal/handler/signoz_handler.go` · `*SignozHandler.QueryLogsByTraceID` — L103, L129, L133
- `src/services/audit-service/internal/handler/signoz_handler.go` · `*SignozHandler.QueryTraces` — L173, L177
- `src/services/integration-service/internal/handler/datasource_handler.go` · `*DatasourceHandler.Create` — L55, L59
- `src/services/integration-service/internal/handler/datasource_handler.go` · `*DatasourceHandler.Delete` — L86, L90
- `src/services/integration-service/internal/handler/datasource_handler.go` · `*DatasourceHandler.GetAll` — L32
- `src/services/integration-service/internal/handler/datasource_handler.go` · `*DatasourceHandler.GetByID` — L41, L46
- `src/services/integration-service/internal/handler/datasource_handler.go` · `*DatasourceHandler.Update` — L68, L73, L77
- `src/services/integration-service/internal/handler/health.go` · `HealthCheck` — L10
- `src/services/integration-service/internal/handler/job_handler.go` · `*JobHandler.GetStatus` — L37, L42
- `src/services/integration-service/internal/handler/job_handler.go` · `*JobHandler.ListHistory` — L70, L75
- `src/services/integration-service/internal/handler/job_handler.go` · `*JobHandler.Push` — L51, L56, L61
- `src/services/integration-service/internal/handler/job_handler.go` · `*JobHandler.Trigger` — L23, L28
- `src/services/integration-service/internal/handler/redis_handler.go` · `*RedisHandler.CheckHealth` — L28, L31
- `src/services/integration-service/internal/handler/redis_handler.go` · `*RedisHandler.DeleteKey` — L69, L73, L76
- `src/services/integration-service/internal/handler/redis_handler.go` · `*RedisHandler.DeleteKeysByPrefix` — L85, L89, L93, L96
- `src/services/integration-service/internal/handler/redis_handler.go` · `*RedisHandler.ListKeys` — L39, L42
- `src/services/integration-service/internal/handler/redis_handler.go` · `*RedisHandler.MGetVersions` — L54, L59
- `src/services/integration-service/internal/handler/schema_handler.go` · `*SchemaHandler.InvalidateSchemaCache` — L30, L36, L42
- `src/services/integration-service/internal/handler/sync_handler.go` · `*SyncHandler.GetPullErrors` — L153
- `src/services/integration-service/internal/handler/sync_handler.go` · `*SyncHandler.GetPullHistory` — L142
- `src/services/integration-service/internal/handler/sync_handler.go` · `*SyncHandler.Run` — L60, L71, L76, L80, L87, L131
- `src/services/mock_datasource/cmd/server/main.go` · `main` — L68
- `src/services/mock_datasource/internal/handler/gen_handler.go` · `*GenHandler.GenAll` — L57
- `src/services/mock_datasource/internal/handler/record_handler.go` · `*RecordHandler.ListSchemas` — L60
- `src/services/mock_datasource/internal/handler/record_handler.go` · `*RecordHandler.Search` — L48
- `src/services/mock_datasource/internal/middleware/whitelist.go` · `IPWhitelist` — L46
- `src/services/sharing-service/internal/handler/health.go` · `RegisterHealth` — L11
- `src/services/sharing-service/internal/handler/share_handler.go` · `*ShareHandler.Share` — L161
- `src/services/sharing-service/internal/handler/share_handler.go` · `*ShareHandler.fail` — L177
- `src/services/sharing-service/internal/handler/summary_handler.go` · `*SummaryHandler.GetFlowRanking` — L106
- `src/services/sharing-service/internal/handler/summary_handler.go` · `*SummaryHandler.GetLatestFlows` — L76
- `src/services/sharing-service/internal/handler/summary_handler.go` · `*SummaryHandler.GetSummary` — L137, L143

### Function quá dài (>50 dòng) — 132

- **Lỗi cụ thể:** Hàm vượt 50 dòng → khó đọc/test/bảo trì.
- **Hướng khắc phục:** Tách function thành các step nhỏ, mỗi function < 50 dòng

**Vị trí:**

- `src/services/admin-service/cmd/server/main.go:82` · `main` — 584 dòng (giới hạn 50)
- `src/services/admin-service/external/dto/danh-muc/response/mock.go:3` · `MockDanhMucResponse` — 67 dòng (giới hạn 50)
- `src/services/admin-service/internal/config/config.go:145` · `LoadConfig` — 179 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/admin_system_log_handler.go:59` · `*AdminSystemLogHandler.Search` — 53 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/danh-muc/handler.go:454` · `*GroupCategoryHandler.ImportCategories` — 52 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/danh-muc/handler.go:521` · `*GroupCategoryHandler.ImportCategoryData` — 66 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/dashboard_handler.go:83` · `*DashboardHandler.GetTrend7Days` — 84 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/data-sharing-config/handler.go:184` · `*DataSharingConfigHandler.List` — 52 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/flink_handler.go:102` · `*FlinkHandler.UploadJar` — 60 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/kho-mo-sync/handler.go:109` · `*Handler.TriggerSync` — 99 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/quan-tri-phan-mem/handler.go:195` · `*ConnectedSystemHandler.List` — 65 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/schema-registry/handler.go:320` · `*SchemaHandler.RegisterSchema` — 59 dòng (giới hạn 50)
- `src/services/admin-service/internal/handler/ttdl/handler.go:127` · `*Handler.triggerPullJob` — 67 dòng (giới hạn 50)
- `src/services/admin-service/internal/middleware/auth.go:12` · `AuthMiddleware` — 71 dòng (giới hạn 50)
- `src/services/admin-service/internal/middleware/permission_middleware.go:21` · `PermissionMiddleware` — 83 dòng (giới hạn 50)
- `src/services/admin-service/internal/pkg/jobscheduler/executor.go:55` · `*Executor.Run` — 57 dòng (giới hạn 50)
- `src/services/admin-service/internal/repository/dashboard_repo.go:92` · `*dashboardRepo.GetSummary` — 140 dòng (giới hạn 50)
- `src/services/admin-service/internal/repository/dashboard_repo.go:721` · `*dashboardRepo.GetTrendMonthly` — 51 dòng (giới hạn 50)
- `src/services/admin-service/internal/repository/dashboard_repo.go:805` · `*dashboardRepo.GetWarehouseRecordTrend` — 63 dòng (giới hạn 50)
- `src/services/admin-service/internal/repository/rbac_repo.go:111` · `*rbacRepository.SeedCatalog` — 88 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go:46` · `findCategoryDataExcelLayout` — 56 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go:108` · `buildCategoryDataValuesFromExcelRow` — 65 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go:262` · `convertExcelValueForColumn` — 52 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_excel_helper.go:374` · `fillCategoryDataImportDefaults` — 182 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_flatten_helper.go:79` · `buildCategoryDataUpdateValues` — 115 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go:39` · `*categoryDataServiceImpl.CreateCategoryData` — 83 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go:211` · `*categoryDataServiceImpl.UpdateCategoryData` — 118 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go:338` · `*categoryDataServiceImpl.DeleteCategoryData` — 52 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_impl.go:528` · `*categoryDataServiceImpl.ImportCategoryData` — 169 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_validator.go:17` · `buildCategoryDataValuesFromFlatItem` — 95 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-data/category_data_validator.go:134` · `validateValueByConfig` — 56 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/category_default_fields.go:5` · `BuildDefaultCategoryFields` — 110 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go:45` · `*categoryGroupImpl.CreateCategoryGroup` — 123 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go:379` · `*categoryGroupImpl.UpdateCategoryGroup` — 131 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go:562` · `*categoryGroupImpl.ImportCategories` — 159 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/category_group_impl.go:746` · `isExtraFieldBreakingChanged` — 54 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/category-group/import_excel_helper.go:142` · `removeVietnameseAccent` — 51 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/dynamic_table_service.go:71` · `*dynamicTableServiceImpl.createCategoryDataTable` — 62 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/dynamic_table_service.go:187` · `buildDefaultDataColumns` — 59 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/sync/mapper.go:59` · `getSyncValueByField` — 97 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/danh-muc/sync/sync_impl.go:34` · `*categorySyncServiceImpl.SyncDataFromKhoMo` — 128 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:86` · `NewDataSharingConfigService` — 72 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:222` · `*dataSharingConfigService.validateReferences` — 55 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:489` · `*dataSharingConfigService.buildConfigFromCreate` — 83 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:670` · `*dataSharingConfigService.provisionPartnerRoute` — 102 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:892` · `*dataSharingConfigService.Create` — 143 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:1038` · `*dataSharingConfigService.Update` — 107 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:1148` · `*dataSharingConfigService.Approve` — 78 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/service.go:1378` · `*dataSharingConfigService.ensureCollectionCronJob` — 57 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/source_endpoint.go:210` · `jsonToStringMap` — 59 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_cleanup.go:125` · `*dataSharingConfigService.deleteWarehouseOnConfigDelete` — 67 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:100` · `*dataSharingConfigService.provisionWarehouseOnApprove` — 129 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:264` · `*dataSharingConfigService.callRegistrySchemaCloudera` — 55 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:362` · `*dataSharingConfigService.callCreateFolderHdfs` — 60 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:425` · `*dataSharingConfigService.callCreateIceberg` — 75 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:524` · `*dataSharingConfigService.callHealthCheckNifi` — 71 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:719` · `*dataSharingConfigService.callCreateNifi` — 80 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data-sharing-config/warehouse_provision.go:853` · `*dataSharingConfigService.postWarehouseAPI` — 56 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data_source_service.go:45` · `*dataSourceService.CreateDataSource` — 58 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/data_source_service.go:133` · `*dataSourceService.UpdateDataSource` — 82 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/flink_service.go:143` · `*flinkService.SubmitFlinkJob` — 74 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/flink_service.go:220` · `*flinkService.submitToFlink` — 53 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/flink_service.go:345` · `*flinkService.CancelWithSavepoint` — 80 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/flink_status_poller.go:68` · `*FlinkStatusPoller.poll` — 56 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/job/job_service.go:45` · `*jobService.Create` — 58 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/job/job_service.go:129` · `*jobService.Update` — 80 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/kafka_manager.go:79` · `*KafkaManager.EnsureTopicExists` — 103 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/kafka_monitor_svc.go:243` · `*kafkaMonitorSvc.GetConsumerGroupLag` — 59 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/kafka_service.go:62` · `*kafkaService.CreateTopic` — 54 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/kong_auth_svc.go:92` · `*KongAuthService.CreateConsumerKey` — 54 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/kong_auth_svc.go:150` · `*KongAuthService.AddPluginToRoute` — 51 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/partner_route_svc.go:53` · `*PartnerRouteService.CreatePartnerRoute` — 154 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/partner_route_svc.go:221` · `*PartnerRouteService.UpdatePartnerRoute` — 54 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go:89` · `*PermissionService.Search` — 80 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/phan-quyen/permission_service.go:179` · `*PermissionService.SearchPermissionGroups` — 59 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_excel.go:93` · `*errorCodeService.ImportErrorCodesExcel` — 69 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/quan-ly-ma-loi/error_code_service.go:182` · `*errorCodeService.UpdateGroup` — 55 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/quan-ly-nguoi-dung/user_service.go:186` · `*userService.saveSSOUsersToDB` — 89 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go:41` · `*connectedSystemService.Create` — 61 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/quan-tri-phan-mem/connected_system_service.go:105` · `*connectedSystemService.Update` — 121 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/route_config_svc.go:111` · `*RouteConfigService.createRouteConfig` — 112 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-registry/json_schema_excel_export.go:79` · `buildSchemaExcelFromParsedFields` — 89 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-registry/service.go:102` · `*schemaRegistryService.ImportSchema` — 75 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-registry/service.go:270` · `*schemaRegistryService.parseXLSX` — 112 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-registry/service.go:509` · `*schemaRegistryService.buildAvroFields` — 65 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-registry/service.go:604` · `*schemaRegistryService.registerToRegistry` — 63 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-wrapper/nifi_parameter.go:25` · `*schemaWrapperService.createNifiParameterContext` — 52 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-wrapper/service.go:64` · `*schemaWrapperService.Create` — 113 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/schema-wrapper/service.go:180` · `*schemaWrapperService.Update` — 133 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/sso/sso_service.go:72` · `*directAuthService.Login` — 271 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/sso/sso_service.go:346` · `*directAuthService.RefreshToken` — 73 dòng (giới hạn 50)
- `src/services/admin-service/internal/service/sso/sso_service.go:531` · `*directAuthService.getUserModulesAndPermissionsByGroups` — 88 dòng (giới hạn 50)
- `src/services/admin-service/pkg/jar_util.go:12` · `ExtractManifestFromJar` — 60 dòng (giới hạn 50)
- `src/services/admin-service/pkg/vault/transit.go:116` · `*VaultClient.BatchDecrypt` — 53 dòng (giới hạn 50)
- `src/services/audit-service/cmd/server/main.go:28` · `main` — 95 dòng (giới hạn 50)
- `src/services/audit-service/internal/config/config.go:36` · `LoadConfig` — 51 dòng (giới hạn 50)
- `src/services/audit-service/internal/service/access_log_service.go:79` · `*AccessLogService.Save` — 79 dòng (giới hạn 50)
- `src/services/audit-service/internal/service/signoz_service.go:150` · `*SignozService.ensureToken` — 51 dòng (giới hạn 50)
- `src/services/audit-service/internal/service/signoz_service.go:204` · `*SignozService.QueryLogs` — 100 dòng (giới hạn 50)
- `src/services/audit-service/internal/service/signoz_service.go:406` · `*SignozService.QueryLogsByTraceID` — 84 dòng (giới hạn 50)
- `src/services/audit-service/internal/service/signoz_service.go:514` · `*SignozService.QueryTraces` — 84 dòng (giới hạn 50)
- `src/services/file-downloader-service/cmd/api/main.go:22` · `main` — 62 dòng (giới hạn 50)
- `src/services/file-downloader-service/internal/config/config.go:63` · `Load` — 61 dòng (giới hạn 50)
- `src/services/file-downloader-service/internal/worker/worker.go:270` · `*Worker.publishResult` — 54 dòng (giới hạn 50)
- `src/services/integration-service/cmd/server/main.go:29` · `main` — 190 dòng (giới hạn 50)
- `src/services/integration-service/internal/config/config.go:43` · `Load` — 52 dòng (giới hạn 50)
- `src/services/integration-service/internal/core/pipeline/delta_filter.go:33` · `*DeltaFilter.ProcessBatch` — 87 dòng (giới hạn 50)
- `src/services/integration-service/internal/core/pipeline/sync_engine.go:81` · `*SyncEngine.Run` — 136 dòng (giới hạn 50)
- `src/services/integration-service/internal/core/pipeline/sync_engine.go:360` · `*SyncEngine.processRecords` — 81 dòng (giới hạn 50)
- `src/services/integration-service/internal/handler/sync_handler.go:55` · `*SyncHandler.Run` — 79 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/bct/adapter.go:26` · `*Adapter.Probe` — 241 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/bct/adapter.go:270` · `*Adapter.FetchPage` — 92 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/bct/client.go:244` · `fetchList` — 103 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/bhxh/client.go:50` · `fetchList` — 103 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/cdlqg/adapter.go:37` · `*Adapter.FetchPage` — 78 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/cdlqg/client.go:51` · `*Client.FetchPage` — 107 dòng (giới hạn 50)
- `src/services/integration-service/internal/provider/cdlqg/client.go:162` · `*Client.FetchDetailRaw` — 108 dòng (giới hạn 50)
- `src/services/integration-service/internal/service/avro_map_union_normalize.go:62` · `normalizeUnionMapForMarshal` — 85 dòng (giới hạn 50)
- `src/services/integration-service/internal/service/ingest_service.go:38` · `*ingestSvc.Run` — 56 dòng (giới hạn 50)
- `src/services/integration-service/internal/service/schema_validator.go:105` · `*schemaValidatorSvc.Validate` — 73 dòng (giới hạn 50)
- `src/services/mock_datasource/cmd/gen/main.go:30` · `main` — 95 dòng (giới hạn 50)
- `src/services/mock_datasource/cmd/server/main.go:23` · `main` — 62 dòng (giới hạn 50)
- `src/services/mock_datasource/internal/handler/search_handler.go:26` · `*SearchHandler.TimKiemDuLieu` — 73 dòng (giới hạn 50)
- `src/services/mock_datasource/internal/handler/search_handler.go:120` · `toSearchItemDTO` — 53 dòng (giới hạn 50)
- `src/services/mock_datasource/internal/handler/search_handler.go:177` · `toDetailDTO` — 53 dòng (giới hạn 50)
- `src/services/mock_datasource/internal/repository/record_repo.go:76` · `*recordRepo.Search` — 57 dòng (giới hạn 50)
- `src/services/sharing-service/internal/client/hue.go:91` · `*HueClient.Count` — 87 dòng (giới hạn 50)
- `src/services/sharing-service/internal/client/hue.go:188` · `*HueClient.ListRows` — 63 dòng (giới hạn 50)
- `src/services/sharing-service/internal/handler/share_handler.go:67` · `*ShareHandler.Share` — 105 dòng (giới hạn 50)
- `tools/convention-scan/internal/report/report.go:23` · `Text` — 64 dòng (giới hạn 50)
- `tools/convention-scan/internal/report/report.go:91` · `Markdown` — 51 dòng (giới hạn 50)
- `tools/convention-scan/main.go:29` · `main` — 51 dòng (giới hạn 50)

### Dockerfile thiếu HEALTHCHECK — 17

- **Lỗi cụ thể:** Image không khai báo HEALTHCHECK → orchestrator không biết container có healthy không.
- **Hướng khắc phục:** HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1

**Vị trí:**

- `deploy/docker/admin-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/audit-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/debug/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/file-downloader-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/integration-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/masking-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/mock-datasource/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/monitoring-service/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/portal-spa/Dockerfile` · `<dockerfile>` — L1
- `deploy/docker/sharing-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/admin-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/audit-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/file-downloader-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/integration-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/masking-service/Dockerfile` · `<dockerfile>` — L1
- `src/services/mock_datasource/Dockerfile` · `<dockerfile>` — L1
- `src/services/monitoring-service/Dockerfile` · `<dockerfile>` — L1


## ⚪ LOW — 3 vi phạm

### Go file đặt tên kebab-case — 3

- **Lỗi cụ thể:** Tên file Go dùng kebab-case (a-b.go) thay vì snake_case (a_b.go) theo chuẩn Go.
- **Hướng khắc phục:** Đổi thành snake_case: group_category.go

**Vị trí:**

- `src/services/admin-service/internal/model/danh-muc/group-category.go:1` · `<file>` — Go file name dùng kebab-case: group-category.go
- `src/services/admin-service/internal/model/data-sharing-config/data-sharing-config-version.go:1` · `<file>` — Go file name dùng kebab-case: data-sharing-config-version.go
- `src/services/admin-service/internal/model/quan-ly-nguoi-dung/sync-history.go:1` · `<file>` — Go file name dùng kebab-case: sync-history.go


## Quét lại

```bash
cd tools/convention-scan && go build -o bin/convention-scan . && cd ../..
find . -type f \( -name '*.go' -o -name 'Dockerfile*' \) \
  ! -path './src/web/*' ! -path '*/vendor/*' ! -path './.git/*' | sed 's|^\./||' \
  | tools/convention-scan/bin/convention-scan --paths-from - --no-color > /tmp/cs.log
python3 tools/convention-scan/gen-report.py /tmp/cs.log docs/convention/BE-convention-violations-report.md
```
