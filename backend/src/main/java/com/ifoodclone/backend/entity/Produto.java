package com.ifoodclone.backend.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "produtos")
public class Produto{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String descricao;


    @Column(nullable = false)
    private BigDecimal preco;



    @Column
    private String imagemUrl;

    @Column(nullable = false)
    private Boolean disponivel = true;

       @Column(nullable = false)
    private Integer quantidade = 0;

    @ManyToOne
    @JoinColumn(name = "restaurante_id", nullable = false)
    private Restaurante restaurante;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();
}

