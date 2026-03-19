package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.PedidoDTO;
import com.ifoodclone.backend.entity.Pedido;
import com.ifoodclone.backend.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {
    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<PedidoDTO> criar(@RequestBody PedidoDTO dto, Principal principal) {
        return ResponseEntity.ok(pedidoService.criar(dto, principal.getName()));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<PedidoDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(pedidoService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/restaurante/{restauranteId}")
    public ResponseEntity<List<PedidoDTO>> listarPorRestaurante(@PathVariable Long restauranteId) {
        return ResponseEntity.ok(pedidoService.listarPorRestaurante(restauranteId));
    }

    @GetMapping("/meus-pedidos")
    public ResponseEntity<List<PedidoDTO>> meusPedidos(Principal principal) {
        return ResponseEntity.ok(pedidoService.listarPorEmail(principal.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoDTO> atualizarStatus(@PathVariable Long id, @RequestParam Pedido.Status status) {
        return ResponseEntity.ok(pedidoService.atualizarStatus(id, status));
    }

    @PostMapping("/{id}/confirmar-entrega")
    public ResponseEntity<?> confirmarEntrega(@PathVariable Long id, @RequestParam String codigo) {
        return ResponseEntity.ok(pedidoService.confirmarEntrega(id, codigo));
    }
}