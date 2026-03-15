package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.RestauranteDTO;
import com.ifoodclone.backend.service.RestauranteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurantes")
@RequiredArgsConstructor
public class RestauranteController {
    private final RestauranteService restauranteService;

    @PostMapping
    public ResponseEntity<RestauranteDTO> criar(@RequestBody RestauranteDTO dto) {
        return ResponseEntity.ok(restauranteService.criar(dto));
    }

    @GetMapping
    public ResponseEntity<List<RestauranteDTO>> listarAtivos() {
        return ResponseEntity.ok(restauranteService.listarAtivos());

    }

    @GetMapping("/{id}")
    public ResponseEntity<RestauranteDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(restauranteService.buscarPorId(id));

    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<RestauranteDTO>> listarPorCategoria(@PathVariable String categoria){
        return ResponseEntity.ok(restauranteService.listarPorCategoria(categoria));
    }

    @GetMapping("/meu-restaurante")
public ResponseEntity<RestauranteDTO> meuRestaurante() {
    String email = org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication().getName();
    return ResponseEntity.ok(restauranteService.buscarPorEmail(email));
}


@PutMapping("/{id}")
public ResponseEntity<RestauranteDTO> atualizar(@PathVariable Long id, @RequestBody RestauranteDTO dto) {
    return ResponseEntity.ok(restauranteService.atualizar(id, dto));
}

@GetMapping("/minhas-lojas")
public ResponseEntity<List<RestauranteDTO>> minhasLojas() {
    String email = org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication().getName();
    return ResponseEntity.ok(restauranteService.listarPorEmail(email));
}

}