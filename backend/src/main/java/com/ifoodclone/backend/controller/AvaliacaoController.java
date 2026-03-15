package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.service.AvaliacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.ifoodclone.backend.service.UsuarioService;

import java.util.Map;

@RestController
@RequestMapping("/api/restaurantes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final UsuarioService usuarioService;

    @PostMapping("/{restauranteId}/avaliar")
    public ResponseEntity<?> avaliar(@PathVariable Long restauranteId, @RequestBody Map<String, Object> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Long usuarioId = usuarioService.buscarPorEmail(email).getId();
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