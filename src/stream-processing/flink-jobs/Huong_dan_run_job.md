{
  "entryClass": "com.gtsc.dmst.flink.SinkChiTietDuLieuRouteToHdfsJob",
  "programArgs": "--job.name dmst_v1_integration_chi_tiet_dulieu_route --source.bootstrap.servers dmst-kafka-1:9092,dmst-kafka-2:9092,dmst-kafka-3:9092 --source.topic dmst_v1_integration_chi_tiet_dulieu_route --source.group.id flink-sink-chi-tiet-dulieu-route --sink.hdfs.path hdfs://dmst-hdfs-namenode:9000/dmst/integration/CHI_TIET_DULIEU_ROUTE --file.sink.topic FILE_DOWNLOAD_REQUEST_CHI_TIET_DULIEU_ROUTE",
  "parallelism": 3
}