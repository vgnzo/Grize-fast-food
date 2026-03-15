package com.ifoodclone.backend.repository;

import com.ifoodclone.backend.entity.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByRestauranteId(Long restauranteId);
    Optional<Avaliacao> findByRestauranteIdAndUsuarioId(Long restauranteId, Long usuarioId);

    @Query("SELECT AVG(a.nota) FROM Avaliacao a WHERE a.restaurante.id = :restauranteId")
    Double findMediaByRestauranteId(@Param("restauranteId") Long restauranteId);
}