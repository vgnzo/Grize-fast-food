package com.ifoodclone.backend.repository;

import com.ifoodclone.backend.entity.MensagemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MensagemPedidoRepository extends JpaRepository<MensagemPedido, Long> {
    List<MensagemPedido> findByPedidoIdOrderByCriadoEm(Long pedidoId);
List<MensagemPedido> findByRestauranteIdAndUsuarioIdOrderByCriadoEm(Long restauranteId, Long usuarioId);

@Query("SELECT DISTINCT m.usuario.id FROM MensagemPedido m WHERE m.restaurante.id = :restauranteId AND m.usuario IS NOT NULL")
List<Long> findUsuarioIdsByRestauranteId(@Param("restauranteId") Long restauranteId);
}