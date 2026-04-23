package com.example.backend.messaging.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.auth.service.CustomUserDetailsService;
import com.example.backend.auth.service.JwtService;
import com.example.backend.messaging.dto.MessageResponse;
import com.example.backend.messaging.entity.MessageDeliveryState;
import com.example.backend.messaging.entity.MessageType;
import com.example.backend.messaging.dto.SendMessageRequest;
import com.example.backend.messaging.service.ConversationService;
import com.example.backend.messaging.service.MessageAuthorizationService;
import com.example.backend.messaging.service.MessageService;
import com.example.backend.messaging.service.PresenceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MessageController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(locations = "classpath:application-test.properties")
class MessageControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockitoBean
  private MessageService messageService;

  @MockitoBean
  private ConversationService conversationService;

  @MockitoBean
  private MessageAuthorizationService messageAuthorizationService;

  @MockitoBean
  private JwtService jwtService;

  @MockitoBean
  private CustomUserDetailsService customUserDetailsService;

  @MockitoBean
  private PresenceService presenceService;

  private UserAccount mockUser() {
    UserAccount user = new UserAccount("User", "user@test.com", "pass", UserRole.USER);
    try {
      var f = UserAccount.class.getDeclaredField("id");
      f.setAccessible(true);
      f.set(user, 1L);
    } catch (Exception ignored) {}
    return user;
  }

  @Test
  void getHistory_shouldReturnMessages_whenAuthorized() throws Exception {
    when(messageService.getHistory(1L, 1L))
        .thenReturn(List.of(new MessageResponse(1L, 1L, 1L, "User", "Hello",
            MessageType.TEXT, MessageDeliveryState.READ, "c1",
            Instant.now(), Instant.now(), Instant.now())));

    mockMvc.perform(get("/api/messages/conversations/1/messages")
            .principal(new UsernamePasswordAuthenticationToken(mockUser(), null)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].body").value("Hello"));
  }

  @Test
  void getHistory_shouldReturnForbidden_whenUnauthorized() throws Exception {
    org.mockito.Mockito.doThrow(new IllegalArgumentException("Not a participant"))
        .when(messageAuthorizationService).requireParticipant(1L, 1L);

    mockMvc.perform(get("/api/messages/conversations/1/messages")
            .principal(new UsernamePasswordAuthenticationToken(mockUser(), null)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void sendMessage_shouldReturnOk_whenValid() throws Exception {
    when(messageService.sendMessage(any(), any()))
        .thenReturn(new MessageResponse(1L, 1L, 1L, "User", "Hello",
            MessageType.TEXT, MessageDeliveryState.SENT, "c1",
            Instant.now(), null, null));

    SendMessageRequest request = new SendMessageRequest(1L, "Hello", "c1");

    mockMvc.perform(post("/api/messages/conversations/1/messages")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request))
            .principal(new UsernamePasswordAuthenticationToken(mockUser(), null)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.body").value("Hello"));
  }
}
