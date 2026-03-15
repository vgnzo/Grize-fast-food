package com.ifoodclone.backend.controller;

import com.ifoodclone.backend.dto.UsuarioDTO;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.security.JwtService;
import com.ifoodclone.backend.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;


    @PostMapping("/cadastro")
    public ResponseEntity<UsuarioDTO> cadastrar(@RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.criar(usuario));
    }

    @PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.get("email"),
            request.get("senha")
        )
    );

    UserDetails userDetails = userDetailsService.loadUserByUsername(request.get("email"));
    
    // Busca o usuário pra pegar o id
    Usuario usuario = usuarioService.buscarPorEmail(request.get("email"));
    String token = jwtService.gerarToken(userDetails, usuario.getId());

    Map<String, String> response = new HashMap<>();
    response.put("token", token);
    return ResponseEntity.ok(response);
}
}
