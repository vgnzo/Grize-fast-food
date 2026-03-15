package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.UsuarioDTO;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor 

public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioDTO> criar(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.criar(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok(usuarioService.buscarPorId(id));


    }


    //, quando alguém fizer uma requisição GET pra /api/usuarios o
    // sistema vai retornar uma lista com todos os usuários cadastrados no banco!
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());

    }




        @GetMapping("/perfil")
        public ResponseEntity<UsuarioDTO> buscarPerfil() {
            String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
                return ResponseEntity.ok(usuarioService.buscarPerfil(email));
        }



@PutMapping("/perfil")
public ResponseEntity<UsuarioDTO> atualizarPerfil(@RequestBody UsuarioDTO dto) {
    String email = org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication().getName();
    return ResponseEntity.ok(usuarioService.atualizarPerfil(email, dto));
}
}
