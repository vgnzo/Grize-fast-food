package com.ifoodclone.backend.repository;

import com.ifoodclone.backend.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioId(Long usuarioId);
    List<Pedido> findByRestauranteId(Long restauranteId);
    List<Pedido> findByStatus(Pedido.Status status);
    List<Pedido> findByRestauranteIdOrderByCriadoEmDesc(Long restauranteId);
    boolean existsByUsuarioIdAndRestauranteId(Long usuarioId, Long restauranteId);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.restaurante.id = :restauranteId AND CAST(p.criadoEm AS date) = :data")
    long countByRestauranteIdAndData(@Param("restauranteId") Long restauranteId, @Param("data") java.time.LocalDate data);
}