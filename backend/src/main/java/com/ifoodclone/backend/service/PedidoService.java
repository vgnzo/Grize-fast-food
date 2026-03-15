package com.ifoodclone.backend.service;

import com.ifoodclone.backend.dto.ItemPedidoDTO;
import com.ifoodclone.backend.dto.PedidoDTO;
import com.ifoodclone.backend.entity.*;
import com.ifoodclone.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestauranteRepository restauranteRepository;
    private final ProdutoRepository produtoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final NotificacaoService notificacaoService;

    // Agora recebe o email do usuário logado pelo JWT (mais seguro)
    public PedidoDTO criar(PedidoDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado!"));

        Restaurante restaurante = restauranteRepository.findById(dto.getRestauranteId())
            .orElseThrow(() -> new RuntimeException("Restaurante não encontrado!"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setRestaurante(restaurante);
        pedido.setEnderecoEntrega(dto.getEnderecoEntrega());
        pedido.setStatus(Pedido.Status.PENDENTE);

        // Calcula o número do pedido do dia para esse restaurante
        LocalDate hoje = LocalDate.now();
            long numeroDia = pedidoRepository.countByRestauranteIdAndData(restaurante.getId(), hoje) + 1;
        pedido.setNumeroDia((int) numeroDia);

        // Gera código de confirmação de 4 dígitos
            String codigo = String.format("%04d", new java.util.Random().nextInt(10000));
            pedido.setCodigoConfirmacao(codigo);

        pedido.setTotal(BigDecimal.ZERO);
        BigDecimal total = BigDecimal.ZERO;
        Pedido pedidoSalvo = pedidoRepository.save(pedido);

        for (ItemPedidoDTO itemDTO : dto.getItens()) {
            Produto produto = produtoRepository.findById(itemDTO.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));

            // Verifica se tem estoque suficiente
            if (produto.getQuantidade() < itemDTO.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente para: " + produto.getNome());
            }

            // Desconta o estoque do produto
            produto.setQuantidade(produto.getQuantidade() - itemDTO.getQuantidade());
            // Se zerar o estoque, marca como indisponível automaticamente
            if (produto.getQuantidade() == 0) {
                produto.setDisponivel(false);
            }
            produtoRepository.save(produto);

            ItemPedido item = new ItemPedido();
            item.setPedido(pedidoSalvo);
            item.setProduto(produto);
            item.setQuantidade(itemDTO.getQuantidade());
            item.setPrecoUnitario(produto.getPreco());
            itemPedidoRepository.save(item);

            total = total.add(produto.getPreco().multiply(BigDecimal.valueOf(itemDTO.getQuantidade())));
        }

        pedidoSalvo.setTotal(total);
        return toDTO(pedidoRepository.save(pedidoSalvo));
    }

    public List<PedidoDTO> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioId(usuarioId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    // Novo método para o painel do restaurante ver os pedidos recebidos
    public List<PedidoDTO> listarPorRestaurante(Long restauranteId) {
        return pedidoRepository.findByRestauranteIdOrderByCriadoEmDesc(restauranteId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

 public PedidoDTO atualizarStatus(Long id, Pedido.Status status) {
    Pedido pedido = pedidoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Pedido não encontrado!"));
    pedido.setStatus(status);
    Pedido salvo = pedidoRepository.save(pedido);

    // Notifica o cliente via WebSocket
    notificacaoService.notificarStatusPedido(
        salvo.getUsuario().getId(),
        salvo.getId(),
        status.name()
    );

    return toDTO(salvo);
}

    private PedidoDTO toDTO(Pedido pedido) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(pedido.getId());
        dto.setUsuarioId(pedido.getUsuario().getId());
        dto.setRestauranteId(pedido.getRestaurante().getId());
        dto.setStatus(pedido.getStatus());
        dto.setTotal(pedido.getTotal());
        dto.setEnderecoEntrega(pedido.getEnderecoEntrega());
        dto.setCriadoEm(pedido.getCriadoEm());
        dto.setCodigoConfirmacao(pedido.getCodigoConfirmacao());
        dto.setNumeroDia(pedido.getNumeroDia());

        if (pedido.getItens() != null) {
    dto.setItens(pedido.getItens().stream().map(item -> {
        ItemPedidoDTO itemDTO = new ItemPedidoDTO();
        itemDTO.setProdutoId(item.getProduto().getId());
        itemDTO.setQuantidade(item.getQuantidade());
        itemDTO.setNomeProduto(item.getProduto().getNome());
        itemDTO.setPrecoUnitario(item.getPrecoUnitario());
        return itemDTO;
    }).collect(Collectors.toList()));
}
        return dto;
    }

    public PedidoDTO confirmarEntrega(Long id, String codigo) {
    Pedido pedido = pedidoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Pedido não encontrado!"));
    
    if (!codigo.equals(pedido.getCodigoConfirmacao())) {
        throw new RuntimeException("Código inválido!");
    }

    pedido.setStatus(Pedido.Status.ENTREGUE);
    Pedido salvo = pedidoRepository.save(pedido);

    notificacaoService.notificarStatusPedido(
        salvo.getUsuario().getId(),
        salvo.getId(),
        "ENTREGUE"
    );

    return toDTO(salvo);
}
}