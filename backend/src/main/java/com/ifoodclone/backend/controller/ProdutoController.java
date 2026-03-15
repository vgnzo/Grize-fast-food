package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.ProdutoDTO;
import com.ifoodclone.backend.service.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor

public class ProdutoController {
    private final ProdutoService produtoService;


    @PostMapping
    public ResponseEntity<ProdutoDTO> criar(@RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.criar(dto));
    } 

    @GetMapping ("/restaurante/{restauranteId}")
    public ResponseEntity<List<ProdutoDTO>> listarPorRestaurante(@PathVariable Long restauranteId){
        return ResponseEntity.ok(produtoService.listarPorRestaurante(restauranteId));
    }
     
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(@PathVariable Long id, @RequestBody ProdutoDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }


    @DeleteMapping("/{id}")
public ResponseEntity<Void> deletar(@PathVariable Long id) {
    produtoService.deletar(id);
    return ResponseEntity.noContent().build();
}

@GetMapping("/restaurante/{restauranteId}/todos")
public ResponseEntity<List<ProdutoDTO>> listarTodosPorRestaurante(@PathVariable Long restauranteId) {
    return ResponseEntity.ok(produtoService.listarTodosPorRestaurante(restauranteId));
}
    }
