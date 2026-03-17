package com.ifoodclone.backend.service;

import com.ifoodclone.backend.dto.RestauranteDTO;
import com.ifoodclone.backend.entity.Restaurante;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.repository.RestauranteRepository;
import com.ifoodclone.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RestauranteService{

    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;

    public RestauranteDTO criar(RestauranteDTO dto) {
    String email = org.springframework.security.core.context.SecurityContextHolder
        .getContext().getAuthentication().getName();
    
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

    Restaurante restaurante = new Restaurante();
    restaurante.setNome(dto.getNome());
    restaurante.setDescricao(dto.getDescricao());
    restaurante.setEndereco(dto.getEndereco());
    restaurante.setImagemUrl(dto.getImagemUrl());
    restaurante.setCategoria(dto.getCategoria());
    restaurante.setAtivo(true);
    restaurante.setUsuario(usuario);

    return toDTO(restauranteRepository.save(restaurante));
}

        public List<RestauranteDTO> listarAtivos() {
            return restauranteRepository.findByativoTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        }

        public RestauranteDTO buscarPorId(Long id) {
            Restaurante restaurante = restauranteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Restaurante não encontrado!"));
            return toDTO(restaurante);
        }

        public List<RestauranteDTO> listarPorCategoria(String categoria) {
            return restauranteRepository.findByCategoria(categoria)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        }

        private RestauranteDTO toDTO(Restaurante restaurante) {
            RestauranteDTO dto = new RestauranteDTO();
            dto.setId(restaurante.getId());
            dto.setNome(restaurante.getNome());
        dto.setDescricao(restaurante.getDescricao());
        dto.setEndereco(restaurante.getEndereco());
        dto.setImagemUrl(restaurante.getImagemUrl());
        dto.setCategoria(restaurante.getCategoria());
        dto.setAtivo(restaurante.getAtivo());
        dto.setUsuarioId(restaurante.getUsuario().getId());
        return dto;
    }

    public RestauranteDTO buscarPorEmail(String email) {
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
    
    return restauranteRepository.findByUsuarioId(usuario.getId())
        .stream()
        .findFirst()
        .map(this::toDTO)
        .orElse(null);
}

public RestauranteDTO atualizar(Long id, RestauranteDTO dto) {
    Restaurante restaurante = restauranteRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Restaurante não encontrado!"));

    restaurante.setNome(dto.getNome());
    restaurante.setDescricao(dto.getDescricao());
    restaurante.setEndereco(dto.getEndereco());
    restaurante.setImagemUrl(dto.getImagemUrl());
    restaurante.setCategoria(dto.getCategoria());

    return toDTO(restauranteRepository.save(restaurante));
}

public List<RestauranteDTO> listarPorEmail(String email) {
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
    
    return restauranteRepository.findByUsuarioId(usuario.getId())
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

public void deletar(Long id) {
    Restaurante restaurante = restauranteRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Restaurante não encontrado!"));
    restauranteRepository.delete(restaurante);
}
        }
