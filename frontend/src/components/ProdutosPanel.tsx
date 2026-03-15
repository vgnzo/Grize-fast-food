import { useState, useEffect } from 'react';
import api from '../services/api';

interface Props {
  lojaAtivaId: number | null;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl: string;
  disponivel: boolean;
  quantidade: number;
}

export default function ProdutosPanel({ lojaAtivaId }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (lojaAtivaId) {
api.get(`/api/produtos/restaurante/${lojaAtivaId}/todos`)
        .then((res: { data: Produto[] }) => setProdutos(res.data))
        .catch(() => {});
    }
  }, [lojaAtivaId]);

  const salvarProduto = async () => {
    if (!lojaAtivaId) {
      setErro('Selecione uma loja primeiro na aba Minha Loja!');
      return;
    }
    try {
      const qtd = parseInt(quantidade) || 0;
      const payload = {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagemUrl,
        disponivel: qtd > 0,
        quantidade: qtd,
        restauranteId: lojaAtivaId,
      };

      if (produtoId) {
        await api.put(`/api/produtos/${produtoId}`, payload);
      } else {
        await api.post('/api/produtos', payload);
      }

      setSucesso('Produto salvo com sucesso!');
      setErro('');
      const res = await api.get(`/api/produtos/restaurante/${lojaAtivaId}`);
      setProdutos(res.data);
      setTimeout(() => setProdutoSelecionado(null), 1000);
    } catch {
      setErro('Erro ao salvar produto!');
      setSucesso('');
    }
  };

  const deletarProduto = async (id: number) => {
    try {
      await api.delete(`/api/produtos/${id}`);
      setProdutos(produtos.filter(p => p.id !== id));
    } catch {
      setErro('Erro ao deletar produto!');
    }
  };

  const inputStyle = {
    width: '100%', background: '#18181b', border: '1px solid #27272a',
    borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div>
      {produtoSelecionado === null ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>🍔 Produtos</h2>
              <p style={{ color: '#52525b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {lojaAtivaId ? 'Gerencie o cardápio da sua loja' : 'Selecione uma loja na aba Minha Loja primeiro'}
              </p>
            </div>
            {lojaAtivaId && (
              <button
                onClick={() => {
                  setProdutoId(null);
                  setNome(''); setDescricao(''); setPreco(''); setImagemUrl(''); setQuantidade('');
                  setProdutoSelecionado(-1);
                }}
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
              >
                + Novo produto
              </button>
            )}
          </div>

          {!lojaAtivaId ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</p>
              <p>Vá até Minha Loja e selecione uma loja para gerenciar os produtos</p>
            </div>
          ) : produtos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍔</p>
              <p>Nenhum produto cadastrado ainda</p>
              <p style={{ fontSize: '0.8rem' }}>Clique em "Novo produto" para começar!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {produtos.map((produto) => {
                const esgotado = produto.quantidade === 0;
                return (
                  <div key={produto.id} style={{ background: '#18181b', border: `1px solid ${esgotado ? 'rgba(248, 113, 113, 0.2)' : '#27272a'}`, borderRadius: '14px', overflow: 'hidden', opacity: esgotado ? 0.7 : 1 }}>
                    <div style={{ height: '100px', background: produto.imagemUrl ? `url(${produto.imagemUrl}) center/cover` : 'linear-gradient(135deg, #1c1c20, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {!produto.imagemUrl && <span style={{ fontSize: '2rem' }}>🍔</span>}
                      {/* Badge de estoque */}
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: esgotado ? 'rgba(248, 113, 113, 0.9)' : 'rgba(52, 211, 153, 0.9)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: '700', color: '#fff' }}>
                        {esgotado ? 'Esgotado' : `${produto.quantidade} un.`}
                      </div>
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <p style={{ fontWeight: '700', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{produto.nome}</p>
                      <p style={{ color: '#52525b', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>{produto.descricao}</p>
                      <p style={{ color: '#a78bfa', fontWeight: '700', margin: '0 0 0.75rem 0' }}>
                        R$ {produto.preco.toFixed(2)}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setProdutoId(produto.id);
                            setNome(produto.nome);
                            setDescricao(produto.descricao);
                            setPreco(produto.preco.toString());
                            setImagemUrl(produto.imagemUrl);
                            setQuantidade(produto.quantidade.toString());
                            setProdutoSelecionado(produto.id);
                          }}
                          style={{ flex: 1, background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#a78bfa', borderRadius: '8px', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletarProduto(produto.id)}
                          style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', padding: '0.4rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setProdutoSelecionado(null); setSucesso(''); setErro(''); }}
              style={{ background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              ← Voltar
            </button>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
              {produtoId ? '✏️ Editar produto' : '🍔 Novo produto'}
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Nome do produto</label>
              <input type="text" placeholder="Ex: Pizza Margherita" value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Descrição</label>
              <textarea placeholder="Descreva o produto..." value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2}
                style={{ ...inputStyle, resize: 'none', fontFamily: "'DM Sans', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Preço (R$)</label>
              <input type="number" placeholder="0.00" value={preco} onChange={(e) => setPreco(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>
                Quantidade em estoque
                <span style={{ color: '#52525b', marginLeft: '0.4rem', fontWeight: '400' }}>(0 = esgotado)</span>
              </label>
              <input type="number" placeholder="Ex: 20" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>URL da imagem</label>
              <input type="text" placeholder="https://..." value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
          </div>

          {/* Preview do status */}
          {quantidade !== '' && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: parseInt(quantidade) > 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', border: `1px solid ${parseInt(quantidade) > 0 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}` }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: parseInt(quantidade) > 0 ? '#34d399' : '#f87171', fontWeight: '600' }}>
                {parseInt(quantidade) > 0
                  ? `✅ Produto aparecerá para clientes com ${quantidade} unidades disponíveis`
                  : '❌ Produto ficará oculto para clientes (estoque zerado)'}
              </p>
            </div>
          )}

          {erro && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '1rem' }}>{erro}</p>}
          {sucesso && <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '1rem' }}>{sucesso}</p>}

          <button onClick={salvarProduto}
            style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
          >
            {produtoId ? 'Atualizar produto' : 'Salvar produto'}
          </button>
        </div>
      )}
    </div>
  );
}