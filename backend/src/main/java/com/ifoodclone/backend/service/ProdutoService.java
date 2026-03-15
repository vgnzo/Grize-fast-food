package com.ifoodclone.backend.service;


import com.ifoodclone.backend.dto.ProdutoDTO;
import com.ifoodclone.backend.entity.Produto;
import com.ifoodclone.backend.entity.Restaurante;
import com.ifoodclone.backend.repository.ProdutoRepository;
import com.ifoodclone.backend.repository.RestauranteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service 
@RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository produtoRepository;
    private final RestauranteRepository restauranteRepository;


    public ProdutoDTO criar(ProdutoDTO dto) {
        Restaurante restaurante = restauranteRepository.findById(dto.getRestauranteId())
                .orElseThrow(() -> new RuntimeException("Restaurante não encontrado!"));

        Produto produto = new Produto();
        produto.setNome(dto.getNome());
        produto.setDescricao(dto.getDescricao());
        produto.setPreco(dto.getPreco());
        produto.setImagemUrl(dto.getImagemUrl());
        produto.setRestaurante(restaurante);
        produto.setDisponivel(dto.getDisponivel() != null ? dto.getDisponivel() : true);
        produto.setQuantidade(dto.getQuantidade() != null ? dto.getQuantidade() : 0);

        return toDTO(produtoRepository.save(produto));
    }

    public List<ProdutoDTO> listarPorRestaurante(Long restauranteId) {
        return produtoRepository.findByRestauranteIdAndDisponivelTrue(restauranteId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProdutoDTO buscarPorId(Long id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
        return toDTO(produto);
    }

    private ProdutoDTO toDTO(Produto produto) {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setId(produto.getId());
        dto.setNome(produto.getNome());
        dto.setDescricao(produto.getDescricao());
        dto.setPreco(produto.getPreco());
        dto.setImagemUrl(produto.getImagemUrl());
        dto.setDisponivel(produto.getDisponivel());
        dto.setQuantidade(produto.getQuantidade()); 
        dto.setRestauranteId(produto.getRestaurante().getId());
        return dto;
    }


    public ProdutoDTO atualizar(Long id, ProdutoDTO dto) {
            // Busca o produto no banco pelo id, se não achar lança uma exceção
        Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));



            // Atualiza os campos do produto com os dados que vieram do front-end
            produto.setNome(dto.getNome());
             produto.setDescricao(dto.getDescricao());
            produto.setPreco(dto.getPreco());
             produto.setImagemUrl(dto.getImagemUrl());
            produto.setDisponivel(dto.getDisponivel());
            produto.setQuantidade(dto.getQuantidade());
    // Salva no banco e retorna como DTO
        return toDTO(produtoRepository.save(produto));
}

  public void deletar(Long id) {
    Produto produto = produtoRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Produto não encontrado!"));
    
    // Soft delete: some do cardápio mas mantém histórico
    produto.setQuantidade(0);
    produto.setDisponivel(false);
    produtoRepository.save(produto);
}

public List<ProdutoDTO> listarTodosPorRestaurante(Long restauranteId) {
    return produtoRepository.findByRestauranteId(restauranteId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
}
 }


