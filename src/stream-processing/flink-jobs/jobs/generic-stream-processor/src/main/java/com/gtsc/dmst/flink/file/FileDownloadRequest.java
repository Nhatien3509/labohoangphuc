package com.gtsc.dmst.flink.file;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;

public class FileDownloadRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("metadataId")
    private String metadataId;

    @JsonProperty("sinkHdfsPath")
    private String sinkHdfsPath;

    @JsonProperty("itemId")
    private String itemId;

    @JsonProperty("fileId")
    private String fileId;

    @JsonProperty("tenTep")
    private String tenTep;

    @JsonProperty("maLoaiDuLieu")
    private String maLoaiDuLieu;

    @JsonProperty("phienBan")
    private String phienBan;

    @JsonProperty("checkSum")
    private String checkSum;

    @JsonProperty("duongDan")
    private String duongDan;

    @JsonProperty("requestTime")
    private String requestTime;

    public FileDownloadRequest() {}

    public FileDownloadRequest(String metadataId, String sinkHdfsPath,
                               String itemId, String fileId, String tenTep,
                               String maLoaiDuLieu, String phienBan, String checkSum, String duongDan,
                               String requestTime) {
        this.metadataId   = metadataId;
        this.sinkHdfsPath = sinkHdfsPath;
        this.itemId       = itemId;
        this.fileId       = fileId;
        this.tenTep       = tenTep;
        this.maLoaiDuLieu = maLoaiDuLieu;
        this.phienBan     = phienBan;
        this.checkSum     = checkSum;
        this.duongDan     = duongDan;
        this.requestTime  = requestTime;
    }

    public String getMetadataId()   { return metadataId; }
    public String getSinkHdfsPath() { return sinkHdfsPath; }
    public String getItemId()       { return itemId; }
    public String getFileId()       { return fileId; }
    public String getTenTep()       { return tenTep; }
    public String getMaLoaiDuLieu() { return maLoaiDuLieu; }
    public String getPhienBan()     { return phienBan; }
    public String getCheckSum()     { return checkSum; }
    public String getDuongDan()     { return duongDan; }
    public String getRequestTime()  { return requestTime; }
}
