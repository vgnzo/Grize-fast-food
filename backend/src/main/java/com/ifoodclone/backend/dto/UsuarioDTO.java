package com.ifoodclone.backend.dto;

import com.ifoodclone.backend.entity.Usuario.Role;
import lombok.Data;


@Data
public class UsuarioDTO {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String endereco;
    private Role role;
}