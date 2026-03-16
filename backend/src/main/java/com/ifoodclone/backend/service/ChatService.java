package com.ifoodclone.backend.service;

import com.ifoodclone.backend.config.N8nConfig;
import com.ifoodclone.backend.repository.ProdutoRepository;
import com.ifoodclone.backend.repository.RestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final N8nConfig n8nConfig;
    private final RestauranteRepository restauranteRepository;
    private final ProdutoRepository produtoRepository;

    public String enviarMensagem(String mensagem, String sessionId) {
        RestTemplate restTemplate = new RestTemplate();

        String restaurantes = restauranteRepository.findAll().stream()
            .filter(r -> r.getAtivo())
            .map(r -> {
                String produtos = produtoRepository.findByRestauranteIdAndDisponivelTrue(r.getId()).stream()
                    .map(p -> "  • " + p.getNome() + " R$" + p.getPreco())
                    .collect(Collectors.joining("\n"));
                return "- " + r.getNome() + " (categoria: " + r.getCategoria() + ", endereço: " + r.getEndereco() + ")\n" + (produtos.isEmpty() ? "  Sem produtos disponíveis" : produtos);
            })
            .collect(Collectors.joining("\n"));

        String mensagemComContexto = "Restaurantes disponíveis no Grize:\n" + restaurantes + "\n\nPergunta do usuário: " + mensagem;

        Map<String, String> body = new HashMap<>();
        body.put("mensagem", mensagemComContexto);
        body.put("sessionId", sessionId);

        HttpHeaders requestHeaders = new HttpHeaders();
        requestHeaders.setContentType(MediaType.APPLICATION_JSON);
        requestHeaders.setAccept(List.of(MediaType.APPLICATION_JSON, MediaType.TEXT_PLAIN, MediaType.ALL));

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, requestHeaders);

        ResponseEntity<String> response = restTemplate.postForEntity(n8nConfig.getWebhookUrl(), request, String.class);

        System.out.println("N8N Status: " + response.getStatusCode());
        System.out.println("N8N Body: " + response.getBody());

        if (response.getBody() != null && !response.getBody().isBlank()) {
            try {
                Map<String, Object> json = new com.fasterxml.jackson.databind.ObjectMapper().readValue(response.getBody(), Map.class);
                Object output = json.get("output");
                if (output != null) return output.toString();
            } catch (Exception e) {
                return response.getBody();
            }
        }

        return "Desculpe, não consegui processar sua mensagem!";
    }
}