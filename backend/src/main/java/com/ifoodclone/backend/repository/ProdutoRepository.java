package com.ifoodclone.backend.repository;

import com.ifoodclone.backend.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByRestauranteId(Long restauranteId);
    List<Produto> findByRestauranteIdAndDisponivelTrue(Long restauranteId);
}