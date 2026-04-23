package com.example.backend.messaging.websocket;

import com.example.backend.auth.service.CustomUserDetailsService;
import com.example.backend.auth.service.JwtService;
import java.util.List;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class MessagingWebSocketInterceptor implements ChannelInterceptor {

  private final JwtService jwtService;
  private final CustomUserDetailsService userDetailsService;

  public MessagingWebSocketInterceptor(
      JwtService jwtService, CustomUserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {
    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
      String token = extractToken(accessor);
      if (token != null) {
        authenticate(accessor, token);
      }
    }

    return message;
  }

  private String extractToken(StompHeaderAccessor accessor) {
    // Try native headers first (some STOMP clients send Authorization header)
    List<String> authHeaders = accessor.getNativeHeader("Authorization");
    if (authHeaders != null && !authHeaders.isEmpty()) {
      String header = authHeaders.get(0);
      if (header.startsWith("Bearer ")) {
        return header.substring(7);
      }
    }

    // Fall back to query parameter token
    String query = accessor.getFirstNativeHeader("token");
    if (query != null && !query.isBlank()) {
      return query;
    }

    return null;
  }

  private void authenticate(StompHeaderAccessor accessor, String token) {
    try {
      String username = jwtService.extractUsername(token);
      if (username != null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        if (jwtService.isTokenValid(token, userDetails)) {
          UsernamePasswordAuthenticationToken authentication =
              new UsernamePasswordAuthenticationToken(
                  userDetails, null, userDetails.getAuthorities());
          accessor.setUser(authentication);
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    } catch (Exception ignored) {
      // Invalid token — leave unauthenticated; Spring Security will reject secured destinations
    }
  }
}
