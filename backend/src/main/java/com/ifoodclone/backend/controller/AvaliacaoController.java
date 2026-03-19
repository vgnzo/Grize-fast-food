package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.repository.PedidoRepository;
import com.ifoodclone.backend.service.AvaliacaoService;
import com.ifoodclone.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurantes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final PedidoRepository pedidoRepository;
    private final AvaliacaoService avaliacaoService;
    private final UsuarioService usuarioService;

    @PostMapping("/{restauranteId}/avaliar")
    public ResponseEntity<?> avaliar(@PathVariable Long restauranteId, @RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();

        boolean temPedido = pedidoRepository.existsByUsuarioIdAndRestauranteId(usuarioId, restauranteId);
        if (!temPedido) {
            return ResponseEntity.status(403).body("Você precisa fazer um pedido antes de avaliar!");
        }

        Integer nota = (Integer) body.get("nota");
        String comentario = (String) body.get("comentario");
        avaliacaoService.avaliar(restauranteId, usuarioId, nota, comentario);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{restauranteId}/media")
    public ResponseEntity<Double> media(@PathVariable Long restauranteId) {
        return ResponseEntity.ok(avaliacaoService.mediaNotas(restauranteId));
    }

    @GetMapping("/{restauranteId}/minha-nota")
    public ResponseEntity<Integer> minhaNota(@PathVariable Long restauranteId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
        return ResponseEntity.ok(avaliacaoService.notaDoUsuario(restauranteId, usuarioId));
    }
}