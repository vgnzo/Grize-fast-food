package com.ifoodclone.backend.repository;



import com.ifoodclone.backend.entity.Restaurante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestauranteRepository extends JpaRepository<Restaurante, Long>
{
    List<Restaurante> findByativoTrue();
    List<Restaurante> findByCategoria(String categoria);
    List<Restaurante> findByUsuarioId(long usuarioId);
}
