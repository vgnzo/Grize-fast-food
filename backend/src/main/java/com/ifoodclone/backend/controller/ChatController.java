package com.ifoodclone.backend.controller;


import com.ifoodclone.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor

public class ChatController {
    private final ChatService chatService;


    @PostMapping("/mensagem")
    public ResponseEntity<Map<String, String>> enviarMensagem(@RequestBody Map<String, String> request){
        String mensagem = request.get("mensagem");
        String sessionId = request.getOrDefault("sessionId", UUID.randomUUID().toString());


        String resposta = chatService.enviarMensagem(mensagem, sessionId);

        return ResponseEntity.ok(Map.of(
            "resposta", resposta,
            "sessionId", sessionId
        ));
    }
}