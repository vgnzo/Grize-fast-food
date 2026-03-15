package com.ifoodclone.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensagens_pedido")
public class MensagemPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = true)
    private Pedido pedido;

    @ManyToOne
    @JoinColumn(name = "restaurante_id")
    private Restaurante restaurante;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Remetente remetente;

    @Column(nullable = false)
    private String texto;

    @Column(name = "criado_em")
    private LocalDateTime criadoEm = LocalDateTime.now();

  public enum Remetente { CLIENTE, RESTAURANTE }

  public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pedido getPedido() { return pedido; }
  public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public Restaurante getRestaurante() { return restaurante; }
  public void setRestaurante(Restaurante restaurante) { this.restaurante = restaurante; }

  public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

   public Remetente getRemetente() { return remetente; }
   public void setRemetente(Remetente remetente) { this.remetente = remetente; }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}