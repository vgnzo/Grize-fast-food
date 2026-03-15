package com.ifoodclone.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class NotificacaoService {
private final SimpMessagingTemplate messagingTemplate;

    public void notificarStatusPedido(Long usuarioId, Long pedidoId, String novoStatus) {
        String mensagem = switch (novoStatus) {
              case "CONFIRMADO"        -> "✅ Seu pedido foi confirmado! Em breve começaremos a preparar.";
            case "PREPARANDO"        -> "👨‍🍳 Seu pedido está sendo preparado!";
            case "SAIU_PARA_ENTREGA" -> "🛵 Seu pedido saiu para entrega!";
            case "ENTREGUE"          -> "🎉 Seu pedido foi entregue! Bom apetite!";
            case "CANCELADO"         -> "❌ Seu pedido foi cancelado.";
            default                  -> "📦 Status do pedido atualizado.";
        };

        //envia pro topico especifico do usario
        messagingTemplate.convertAndSend(
            "/topic/pedidos/" + usuarioId,
            new NotificacaoDTO(pedidoId, novoStatus, mensagem)
        );
    }



    //DTO interno da notificação
        public record NotificacaoDTO(Long pedidoId, String status, String mensagem) {}

}