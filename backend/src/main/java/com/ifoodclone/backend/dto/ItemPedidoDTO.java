package com.ifoodclone.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemPedidoDTO {
    private Long id;
    private Long pedidoId;
    private Long produtoId;
    private Integer quantidade;
    private BigDecimal precoUnitario;
    private String nomeProduto;
}
