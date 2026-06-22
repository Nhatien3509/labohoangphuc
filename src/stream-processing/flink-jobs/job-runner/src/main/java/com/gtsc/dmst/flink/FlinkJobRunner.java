package com.gtsc.dmst.flink;

import org.apache.flink.api.common.restartstrategy.RestartStrategies;
import org.apache.flink.api.common.time.Time;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.table.api.bridge.java.StreamTableEnvironment;
import org.yaml.snakeyaml.Yaml;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Generic Flink job runner — dùng chung cho tất cả luồng.
 *
 * Cách dùng:
 *   flink run -c com.gtsc.dmst.flink.FlinkJobRunner flink-job-runner.jar <job-dir>
 *
 * Ví dụ:
 *   flink run ... flink-job-runner.jar /opt/flink/jobs/job6-kho-mo-datasources
 *
 * Mỗi <job-dir> cần có:
 *   job.yaml      — tên job, parallelism, checkpoint interval
 *   source.sql    — CREATE TABLE source
 *   sink.sql      — CREATE TABLE sink
 *   transform.sql — INSERT INTO
 */
public class FlinkJobRunner {

    public static void main(String[] args) throws Exception {
        if (args.length < 1) {
            System.err.println("Usage: FlinkJobRunner <job-dir>");
            System.exit(1);
        }

        Path jobDir = Paths.get(args[0]);
        JobConfig config = loadConfig(jobDir);

        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        configureCheckpoint(env, config);
        configureRestart(env);
        env.setParallelism(config.parallelism);

        StreamTableEnvironment tEnv = StreamTableEnvironment.create(env);
        tEnv.getConfig().set("pipeline.name", config.name);

        tEnv.executeSql(readSql(jobDir, "source.sql"));
        tEnv.executeSql(readSql(jobDir, "sink.sql"));
        tEnv.executeSql(readSql(jobDir, "transform.sql"));
    }

    // ── Config ───────────────────────────────────────────────────────────────

    static class JobConfig {
        String name;
        int    parallelism       = 3;
        long   checkpointMs      = 60_000;
        String checkpointDir     = "file:///opt/flink/ha-storage/checkpoints";
    }

    @SuppressWarnings("unchecked")
    private static JobConfig loadConfig(Path jobDir) throws IOException {
        Path yamlPath = jobDir.resolve("job.yaml");
        JobConfig cfg = new JobConfig();

        try (InputStream is = Files.newInputStream(yamlPath)) {
            Map<String, Object> yaml = new Yaml().load(is);
            cfg.name          = (String)  yaml.getOrDefault("name",           jobDir.getFileName().toString());
            cfg.parallelism   = (Integer) yaml.getOrDefault("parallelism",    3);
            cfg.checkpointMs  = ((Number) yaml.getOrDefault("checkpoint_ms",  60_000L)).longValue();
            cfg.checkpointDir = (String)  yaml.getOrDefault("checkpoint_dir", cfg.checkpointDir);
        }
        return cfg;
    }

    // ── Flink config ─────────────────────────────────────────────────────────

    private static void configureCheckpoint(StreamExecutionEnvironment env, JobConfig cfg) {
        env.enableCheckpointing(cfg.checkpointMs, CheckpointingMode.EXACTLY_ONCE);
        env.getCheckpointConfig().setMinPauseBetweenCheckpoints(30_000);
        env.getCheckpointConfig().setCheckpointTimeout(120_000);
        env.getCheckpointConfig().setMaxConcurrentCheckpoints(1);
        env.getCheckpointConfig().setCheckpointStorage(cfg.checkpointDir);
    }

    private static void configureRestart(StreamExecutionEnvironment env) {
        env.setRestartStrategy(
            RestartStrategies.exponentialDelayRestart(
                Time.of(1, TimeUnit.SECONDS),
                Time.of(5, TimeUnit.MINUTES),
                2.0,
                Time.of(1, TimeUnit.HOURS),
                0.1
            )
        );
    }

    // ── SQL loader ───────────────────────────────────────────────────────────

    private static String readSql(Path jobDir, String fileName) throws IOException {
        Path sqlPath = jobDir.resolve(fileName);
        return Files.readString(sqlPath, StandardCharsets.UTF_8);
    }
}
