package com.ifoodclone.backend.service;

import com.ifoodclone.backend.config.N8nConfig;
import com.ifoodclone.backend.repository.ProdutoRepository;
import com.ifoodclone.backend.repository.RestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
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
        RestTemplate restTemplate = new RestTemplate();

        // Busca restaurantes ativos do banco e monta contexto
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

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<?> response = restTemplate.postForEntity(n8nConfig.getWebhookUrl(), request, Map.class);

        if (response.getBody() != null) {
            Map<?, ?> responseBody = (Map<?, ?>) response.getBody();
            return responseBody.get("output").toString();
        }

        return "Desculpe, não consegui processar sua mensagem!";
    }
}