package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.MensagemPedidoDTO;
import com.ifoodclone.backend.entity.MensagemPedido;
import com.ifoodclone.backend.service.MensagemPedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MensagemPedidoController {

    private final MensagemPedidoService mensagemService;

    // Chat de pedido
    @GetMapping("/api/pedidos/{pedidoId}/mensagens")
public ResponseEntity<List<MensagemPedidoDTO>> listar(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(mensagemService.listar(pedidoId));
    }

    @GetMapping("/api/restaurantes/{restauranteId}/chat/usuarios")
public ResponseEntity<List<Long>> listarUsuarios(@PathVariable Long restauranteId) {
    return ResponseEntity.ok(mensagemService.listarUsuariosComMensagem(restauranteId));
}

    @PostMapping("/api/pedidos/{pedidoId}/mensagens")
    public ResponseEntity<MensagemPedidoDTO> enviar(@PathVariable Long pedidoId, @RequestBody Map<String, String> body) {
  String texto = body.get("texto");
        MensagemPedido.Remetente remetente = MensagemPedido.Remetente.valueOf(body.get("remetente"));
     return ResponseEntity.ok(mensagemService.enviar(pedidoId, texto, remetente));
    }







    // Chat geral do restaurante
    @GetMapping("/api/restaurantes/{restauranteId}/chat/{usuarioId}")
    public ResponseEntity<List<MensagemPedidoDTO>> listarChat(@PathVariable Long restauranteId, @PathVariable Long usuarioId) {
        return ResponseEntity.ok(mensagemService.listarChat(restauranteId, usuarioId));
    }

    @PostMapping("/api/restaurantes/{restauranteId}/chat/{usuarioId}")
    public ResponseEntity<MensagemPedidoDTO> enviarChat(@PathVariable Long restauranteId, @PathVariable Long usuarioId, @RequestBody Map<String, String> body) {
        String texto = body.get("texto");
        MensagemPedido.Remetente remetente = MensagemPedido.Remetente.valueOf(body.get("remetente"));
        return ResponseEntity.ok(mensagemService.enviarChat(restauranteId, usuarioId, texto, remetente));
    }
}