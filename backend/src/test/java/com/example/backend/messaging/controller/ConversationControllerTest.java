package com.example.backend.messaging.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.auth.entity.UserAccount;
import com.example.backend.auth.entity.UserRole;
import com.example.backend.messaging.dto.ConversationSummaryResponse;
import com.example.backend.messaging.entity.Conversation;
import com.example.backend.messaging.service.ConversationService;
import com.example.backend.auth.service.CustomUserDetailsService;
import com.example.backend.auth.service.JwtService;
import com.example.backend.messaging.service.MessageAuthorizationService;
import com.example.backend.messaging.service.MessageService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ConversationController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(locations = "classpath:application-test.properties")
class ConversationControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private ConversationService conversationService;

  @MockitoBean
  private MessageService messageService;

  @MockitoBean
  private MessageAuthorizationService messageAuthorizationService;

  @MockitoBean
  private JwtService jwtService;

  @MockitoBean
  private CustomUserDetailsService customUserDetailsService;

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
  void getOrCreateConversation_shouldReturnOk_whenValid() throws Exception {
    Conversation conv = new Conversation("1_2", 1L);
    try {
      var f = Conversation.class.getDeclaredField("id");
      f.setAccessible(true);
      f.set(conv, 42L);
    } catch (Exception ignored) {}
    when(conversationService.findOrCreateConversation(1L, 2L)).thenReturn(conv);

    mockMvc.perform(get("/api/messages/conversations/with-expert/2")
            .principal(new UsernamePasswordAuthenticationToken(mockUser(), null)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.conversationKey").value("1_2"))
        .andExpect(jsonPath("$.conversationId").value(42));
  }

  @Test
  void listConversations_shouldReturnList() throws Exception {
    when(conversationService.listConversationsForUser(1L))
        .thenReturn(List.of(new ConversationSummaryResponse(
            1L, "1_2", 1L, Instant.now(), Instant.now(), Instant.now(),
            2L, "Expert", "Hello", 0)));

    mockMvc.perform(get("/api/messages/conversations")
            .principal(new UsernamePasswordAuthenticationToken(mockUser(), null)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].otherParticipantName").value("Expert"));
  }
}
