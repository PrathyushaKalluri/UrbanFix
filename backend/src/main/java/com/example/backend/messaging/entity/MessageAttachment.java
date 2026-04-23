package com.example.backend.messaging.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

/**
 * Reserved schema for future attachment support.
 * Not used in v1. Included now to avoid schema migration later.
 */
@Entity
@Table(name = "message_attachments")
public class MessageAttachment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "message_id", nullable = false)
  private Message message;

  @Column(name = "object_key", nullable = false, length = 512)
  private String objectKey;

  @Column(name = "file_name", nullable = false, length = 255)
  private String fileName;

  @Column(name = "mime_type", nullable = false, length = 128)
  private String mimeType;

  @Column(name = "file_size")
  private Long fileSize;

  @Column(name = "checksum", length = 64)
  private String checksum;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  protected MessageAttachment() {
  }

  public MessageAttachment(Message message, String objectKey, String fileName, String mimeType) {
    this.message = message;
    this.objectKey = objectKey;
    this.fileName = fileName;
    this.mimeType = mimeType;
    this.createdAt = Instant.now();
  }

  public Long getId() {
    return id;
  }

  public Message getMessage() {
    return message;
  }

  public String getObjectKey() {
    return objectKey;
  }

  public String getFileName() {
    return fileName;
  }

  public String getMimeType() {
    return mimeType;
  }

  public Long getFileSize() {
    return fileSize;
  }

  public void setFileSize(Long fileSize) {
    this.fileSize = fileSize;
  }

  public String getChecksum() {
    return checksum;
  }

  public void setChecksum(String checksum) {
    this.checksum = checksum;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    MessageAttachment that = (MessageAttachment) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
