package com.ifoodclone.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProdutoDTO{
    private Long id;
        private String nome;
    private String descricao;
    private BigDecimal preco;
    private String imagemUrl;
    private Boolean disponivel;
    private Integer quantidade;
    private Long restauranteId;

}