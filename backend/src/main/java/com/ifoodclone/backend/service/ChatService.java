package com.ifoodclone.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ifoodclone.backend.config.N8nConfig;
import com.ifoodclone.backend.repository.ProdutoRepository;
import com.ifoodclone.backend.repository.RestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final N8nConfig n8nConfig;
    private final RestauranteRepository restauranteRepository;
    private final ProdutoRepository produtoRepository;

    public String enviarMensagem(String mensagem, String sessionId) {
        try {
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

            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> bodyMap = new HashMap<>();
            bodyMap.put("mensagem", mensagemComContexto);
            bodyMap.put("sessionId", sessionId);
            String bodyJson = mapper.writeValueAsString(bodyMap);

            HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(n8nConfig.getWebhookUrl()))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("N8N Status: " + response.statusCode());
            System.out.println("N8N Body: " + response.body());

            if (response.body() != null && !response.body().isBlank()) {
                Map<String, Object> json = mapper.readValue(response.body(), Map.class);
                Object output = json.get("output");
                if (output != null) return output.toString();
            }

        } catch (Exception e) {
            System.out.println("Erro ao chamar n8n: " + e.getMessage());
        }

        return "Desculpe, não consegui processar sua mensagem!";
    }
}