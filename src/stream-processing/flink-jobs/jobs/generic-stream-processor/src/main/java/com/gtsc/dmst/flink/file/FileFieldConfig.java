package com.gtsc.dmst.flink.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class FileFieldConfig implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("fileListPath")
    private String fileListPath;

    @JsonProperty("downloadRequestTopic")
    private String downloadRequestTopic = "FILE_DOWNLOAD_REQUEST_{maLoaiDuLieu}";

    @JsonProperty("itemIdField")
    private String itemIdField = "itemId";

    @JsonProperty("fileIdField")
    private String fileIdField = "fileId";

    @JsonProperty("tenTepField")
    private String tenTepField = "tenTep";

    @JsonProperty("phienBanField")
    private String phienBanField = "phienBan";

    @JsonProperty("checkSumField")
    private String checkSumField = "checkSum";

    @JsonProperty("duongDanField")
    private String duongDanField = "duongDan";

    @JsonProperty("maLoaiDuLieuField")
    private String maLoaiDuLieuField = "maLoaiDuLieu";

    public FileFieldConfig() {}

    public String getFileListPath()  { return fileListPath; }
    public void setFileListPath(String v)  { this.fileListPath = v; }
    public String getDownloadRequestTopic() { return downloadRequestTopic; }
    public void setDownloadRequestTopic(String v) { this.downloadRequestTopic = v; }

    public String getItemIdField()   { return itemIdField; }
    public String getFileIdField()   { return fileIdField; }
    public String getTenTepField()   { return tenTepField; }
    public String getPhienBanField() { return phienBanField; }
    public String getCheckSumField() { return checkSumField; }
    public String getDuongDanField() { return duongDanField; }
    public String getMaLoaiDuLieuField() { return maLoaiDuLieuField; }

    public void setItemIdField(String v)   { this.itemIdField = v; }
    public void setFileIdField(String v)   { this.fileIdField = v; }
    public void setTenTepField(String v)   { this.tenTepField = v; }
    public void setPhienBanField(String v) { this.phienBanField = v; }
    public void setCheckSumField(String v) { this.checkSumField = v; }
    public void setDuongDanField(String v) { this.duongDanField = v; }
    public void setMaLoaiDuLieuField(String v) { this.maLoaiDuLieuField = v; }
}
