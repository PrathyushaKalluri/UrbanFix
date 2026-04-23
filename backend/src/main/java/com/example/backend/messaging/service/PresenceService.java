package com.example.backend.messaging.service;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class PresenceService {

  private static final String PRESENCE_PREFIX = "presence:";
  private static final Duration PRESENCE_TTL = Duration.ofSeconds(30);

  private final StringRedisTemplate redisTemplate;

  public PresenceService(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  public void markOnline(Long userId) {
    String key = PRESENCE_PREFIX + userId;
    redisTemplate.opsForValue().set(key, "online", PRESENCE_TTL);
  }

  public void markOffline(Long userId) {
    String key = PRESENCE_PREFIX + userId;
    redisTemplate.delete(key);
  }

  public boolean isOnline(Long userId) {
    String key = PRESENCE_PREFIX + userId;
    Boolean exists = redisTemplate.hasKey(key);
    return Boolean.TRUE.equals(exists);
  }

  public void refreshHeartbeat(Long userId) {
    String key = PRESENCE_PREFIX + userId;
    if (Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
      redisTemplate.expire(key, PRESENCE_TTL);
    }
  }
}
