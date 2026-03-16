package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.RestauranteDTO;
import com.ifoodclone.backend.service.RestauranteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.ifoodclone.backend.repository.ProdutoRepository;
import java.util.Map;


@RestController
@RequestMapping("/api/restaurantes")
@RequiredArgsConstructor
public class RestauranteController {
    private final RestauranteService restauranteService;
    private final ProdutoRepository produtoRepository;
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
@GetMapping("/completo")
public ResponseEntity<List<Map<String, Object>>> listarComProdutos() {
    List<RestauranteDTO> restaurantes = restauranteService.listarAtivos();
    List<Map<String, Object>> resultado = restaurantes.stream().map(r -> {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("nome", r.getNome());
        map.put("categoria", r.getCategoria());
        map.put("endereco", r.getEndereco());
        map.put("descricao", r.getDescricao());
        
        List<Map<String, Object>> produtos = produtoRepository
            .findByRestauranteIdAndDisponivelTrue(r.getId())
            .stream().map(p -> {
                Map<String, Object> mp = new java.util.HashMap<>();
                mp.put("nome", p.getNome());
                mp.put("descricao", p.getDescricao());
                mp.put("preco", p.getPreco());
                return mp;
            }).collect(java.util.stream.Collectors.toList());
        
        map.put("produtos", produtos);
        return map;
    }).collect(java.util.stream.Collectors.toList());
    return ResponseEntity.ok(resultado);
}
}