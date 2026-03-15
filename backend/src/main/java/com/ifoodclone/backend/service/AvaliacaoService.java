package com.ifoodclone.backend.service;

import com.ifoodclone.backend.entity.Avaliacao;
import com.ifoodclone.backend.entity.Restaurante;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.repository.AvaliacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;

    public void avaliar(Long restauranteId, Long usuarioId, Integer nota, String comentario) {
        // Se já avaliou, atualiza
        Avaliacao avaliacao = avaliacaoRepository
            .findByRestauranteIdAndUsuarioId(restauranteId, usuarioId)
            .orElse(new Avaliacao());

        Restaurante restaurante = new Restaurante();
        restaurante.setId(restauranteId);
        avaliacao.setRestaurante(restaurante);

        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        avaliacao.setUsuario(usuario);

        avaliacao.setNota(nota);
        avaliacao.setComentario(comentario);
        avaliacaoRepository.save(avaliacao);
    }

    public Double mediaNotas(Long restauranteId) {
        Double media = avaliacaoRepository.findMediaByRestauranteId(restauranteId);
        return media != null ? media : 0.0;
    }

    public Integer notaDoUsuario(Long restauranteId, Long usuarioId) {
        return avaliacaoRepository.findByRestauranteIdAndUsuarioId(restauranteId, usuarioId)
            .map(Avaliacao::getNota)
            .orElse(0);
    }
}