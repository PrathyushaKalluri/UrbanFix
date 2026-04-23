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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
    name = "conversation_participants",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"conversation_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_participant_user", columnList = "user_id")
    }
)
public class ConversationParticipant {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "conversation_id", nullable = false)
  private Conversation conversation;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "joined_at", nullable = false, updatable = false)
  private Instant joinedAt;

  @Column(name = "last_read_at")
  private Instant lastReadAt;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive = true;

  protected ConversationParticipant() {
  }

  public ConversationParticipant(Conversation conversation, Long userId) {
    this.conversation = conversation;
    this.userId = userId;
    this.joinedAt = Instant.now();
    this.isActive = true;
  }

  public Long getId() {
    return id;
  }

  public Conversation getConversation() {
    return conversation;
  }

  public Long getUserId() {
    return userId;
  }

  public Instant getJoinedAt() {
    return joinedAt;
  }

  public Instant getLastReadAt() {
    return lastReadAt;
  }

  public void setLastReadAt(Instant lastReadAt) {
    this.lastReadAt = lastReadAt;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ConversationParticipant that = (ConversationParticipant) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
