package com.ifoodclone.backend.service;



import com.ifoodclone.backend.dto.UsuarioDTO;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
private final PasswordEncoder passwordEncoder;

public UsuarioDTO criar(Usuario usuario) {
    if (usuarioRepository.existsByEmail(usuario.getEmail())){
        throw new RuntimeException("Email ja cadastrado!");

    }

    usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
    Usuario salvo = usuarioRepository.save(usuario);
    return toDTO(salvo);
}

public UsuarioDTO buscarPorId(Long id ){
    Usuario usuario = usuarioRepository.findById(id)
    .orElseThrow(() -> new RuntimeException("Usuario não encontrado!"));
    return toDTO(usuario);


}

public List<UsuarioDTO> listarTodos() {
    return usuarioRepository.findAll()
        .stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
}

public Usuario buscarPorEmail(String email) {
    return usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
}

 public UsuarioDTO buscarPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
        return toDTO(usuario);
    }

        public UsuarioDTO atualizarPerfil(String email, UsuarioDTO dto) {
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));
    if (dto.getNome() != null) usuario.setNome(dto.getNome());
    if (dto.getTelefone() != null) usuario.setTelefone(dto.getTelefone());
    if (dto.getEndereco() != null) usuario.setEndereco(dto.getEndereco());
    return toDTO(usuarioRepository.save(usuario));
}


private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setTelefone(usuario.getTelefone());
        dto.setEndereco(usuario.getEndereco());
        dto.setRole(usuario.getRole());
        return dto;
    }
}
