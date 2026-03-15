package com.ifoodclone.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Data
@Entity
@Table(name = "usuarios")



public class Usuario {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;


    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha;


    @Column 
    private String telefone;

    @Column 
    private String endereco;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;


    @Column(name = "criado_em")
    private LocalDateTime criadEm = LocalDateTime.now();

    public static enum Role{
        CLIENTE, RESTAURANTE, ADMIN
    }
}
