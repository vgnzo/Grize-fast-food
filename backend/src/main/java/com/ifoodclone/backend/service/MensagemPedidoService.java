package com.ifoodclone.backend.service;

import com.ifoodclone.backend.dto.MensagemPedidoDTO;
import com.ifoodclone.backend.entity.MensagemPedido;
import com.ifoodclone.backend.entity.Pedido;
import com.ifoodclone.backend.entity.Restaurante;
import com.ifoodclone.backend.entity.Usuario;
import com.ifoodclone.backend.repository.MensagemPedidoRepository;
import com.ifoodclone.backend.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MensagemPedidoService {

    private final MensagemPedidoRepository mensagemRepository;
    private final PedidoRepository pedidoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<MensagemPedidoDTO> listar(Long pedidoId) {
        return mensagemRepository.findByPedidoIdOrderByCriadoEm(pedidoId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MensagemPedidoDTO enviar(Long pedidoId, String texto, MensagemPedido.Remetente remetente) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado!"));

        MensagemPedido msg = new MensagemPedido();
        msg.setPedido(pedido);
        msg.setTexto(texto);
        msg.setRemetente(remetente);

        MensagemPedidoDTO dto = toDTO(mensagemRepository.save(msg));

        messagingTemplate.convertAndSend("/topic/pedido/" + pedidoId + "/mensagens", dto);
        messagingTemplate.convertAndSend("/topic/usuario/" + pedido.getUsuario().getId(), dto);

        return dto;
    }

    public List<MensagemPedidoDTO> listarChat(Long restauranteId, Long usuarioId) {
        return mensagemRepository.findByRestauranteIdAndUsuarioIdOrderByCriadoEm(restauranteId, usuarioId)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public MensagemPedidoDTO enviarChat(Long restauranteId, Long usuarioId, String texto, MensagemPedido.Remetente remetente) {
        MensagemPedido msg = new MensagemPedido();
        msg.setTexto(texto);
        msg.setRemetente(remetente);

        Restaurante restaurante = new Restaurante();
        restaurante.setId(restauranteId);
        msg.setRestaurante(restaurante);

        Usuario usuario = new Usuario();
        usuario.setId(usuarioId);
        msg.setUsuario(usuario);

        return toDTO(mensagemRepository.save(msg));
    }

    public List<Long> listarUsuariosComMensagem(Long restauranteId) {
    return mensagemRepository.findUsuarioIdsByRestauranteId(restauranteId);
}

    private MensagemPedidoDTO toDTO(MensagemPedido m) {
        MensagemPedidoDTO dto = new MensagemPedidoDTO();
        dto.setId(m.getId());
        dto.setPedidoId(m.getPedido() != null ? m.getPedido().getId() : null);
        dto.setRemetente(m.getRemetente().name());
        dto.setTexto(m.getTexto());
        dto.setCriadoEm(m.getCriadoEm());
        return dto;
    }
}