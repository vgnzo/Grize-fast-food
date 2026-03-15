package com.ifoodclone.backend.dto;

import lombok.Data;

@Data
public class RestauranteDTO{
    private Long id;
    private String nome;
     private String descricao;
    private String endereco;
    private String imagemUrl;
    private String categoria;
    private Boolean ativo;
    private Long usuarioId;
}