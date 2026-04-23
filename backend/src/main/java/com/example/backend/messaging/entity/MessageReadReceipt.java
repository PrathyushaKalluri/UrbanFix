package com.example.backend.messaging.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
    name = "message_receipts",
    indexes = {
        @Index(name = "idx_receipt_message_recipient", columnList = "message_id, recipient_user_id")
    }
)
public class MessageReadReceipt {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "message_id", nullable = false)
  private Message message;

  @Column(name = "recipient_user_id", nullable = false)
  private Long recipientUserId;

  @Column(name = "delivered_at")
  private Instant deliveredAt;

  @Column(name = "read_at")
  private Instant readAt;

  protected MessageReadReceipt() {
  }

  public MessageReadReceipt(Message message, Long recipientUserId) {
    this.message = message;
    this.recipientUserId = recipientUserId;
  }

  public Long getId() {
    return id;
  }

  public Message getMessage() {
    return message;
  }

  public Long getRecipientUserId() {
    return recipientUserId;
  }

  public Instant getDeliveredAt() {
    return deliveredAt;
  }

  public void setDeliveredAt(Instant deliveredAt) {
    this.deliveredAt = deliveredAt;
  }

  public Instant getReadAt() {
    return readAt;
  }

  public void setReadAt(Instant readAt) {
    this.readAt = readAt;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    MessageReadReceipt that = (MessageReadReceipt) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
