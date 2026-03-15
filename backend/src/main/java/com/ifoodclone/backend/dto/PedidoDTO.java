package com.ifoodclone.backend.dto;


import com.ifoodclone.backend.entity.Pedido.Status;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoDTO{
    private Long id;
    private Long usuarioId;
    private Long restauranteId;
    private Status status;
    private BigDecimal total;
    private String enderecoEntrega;
    private List<ItemPedidoDTO> itens;
    private LocalDateTime criadoEm;
    private String codigoConfirmacao;
    private Integer numeroDia;
}