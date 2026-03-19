import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DelivBot from '../components/DelivBot';

interface Restaurante {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  imagemUrl: string;
  endereco: string;
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

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

interface Mensagem {
  id: number;
  remetente: string;
  texto: string;
  criadoEm: string;
}

export default function RestaurantePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { email, logout, usuarioId } = useAuth();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [finalizando, setFinalizando] = useState(false);
  const [pedidoFeito, setPedidoFeito] = useState(false);
  const [erroPedido, setErroPedido] = useState('');
  const [codigoPedido, setCodigoPedido] = useState<string | null>(null);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [mensagensPedido, setMensagensPedido] = useState<Mensagem[]>([]);
  const [inputMensagemPedido, setInputMensagemPedido] = useState('');
  const [enviandoMsgPedido, setEnviandoMsgPedido] = useState(false);
  const [delivBotAberto, setDelivBotAberto] = useState(false);
  const [mediaRestaurante, setMediaRestaurante] = useState(0);

  // Endereço
  const [modalEnderecoAberto, setModalEnderecoAberto] = useState(false);
  const [enderecoEntrega, setEnderecoEntrega] = useState('');

  // Avaliação
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(0);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [avaliacaoFeita, setAvaliacaoFeita] = useState(false);
  const [minhaNotaAtual, setMinhaNotaAtual] = useState(0);
  const [temPedido, setTemPedido] = useState(false);

  // Chat geral
  const [chatGeralAberto, setChatGeralAberto] = useState(false);
  const [mensagensGeral, setMensagensGeral] = useState<Mensagem[]>([]);
  const [inputMensagemGeral, setInputMensagemGeral] = useState('');
  const [enviandoMsgGeral, setEnviandoMsgGeral] = useState(false);

  const bottomRefPedido = useRef<HTMLDivElement>(null);
  const bottomRefGeral = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get(`/api/restaurantes/${id}`).then((res: { data: Restaurante }) => setRestaurante(res.data));
    api.get(`/api/produtos/restaurante/${id}`).then((res: { data: Produto[] }) => setProdutos(res.data));
    api.get('/api/usuarios/perfil').then((res) => { if (res.data?.endereco) setEnderecoEntrega(res.data.endereco); }).catch(() => {});
    api.get(`/api/restaurantes/${id}/media`).then((res) => setMediaRestaurante(res.data || 0)).catch(() => {});
    api.get(`/api/restaurantes/${id}/minha-nota`).then((res) => { setMinhaNotaAtual(res.data || 0); setNotaSelecionada(res.data || 0); }).catch(() => {});
    api.get('/api/pedidos/meus-pedidos')
      .then((res) => {
const temPedidoNesseRestaurante = res.data.some((p: { restauranteId: number }) => p.restauranteId === Number(id));        setTemPedido(temPedidoNesseRestaurante);
      }).catch(() => {});
  }, [id]);

  useEffect(() => { bottomRefPedido.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagensPedido]);
  useEffect(() => { bottomRefGeral.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagensGeral]);

  useEffect(() => {
    if (!pedidoId) return;
    const interval = setInterval(() => {
      api.get(`/api/pedidos/${pedidoId}/mensagens`).then((res: { data: Mensagem[] }) => setMensagensPedido(res.data)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  useEffect(() => {
    if (!chatGeralAberto || !usuarioId) return;
    api.get(`/api/restaurantes/${id}/chat/${usuarioId}`).then((res: { data: Mensagem[] }) => setMensagensGeral(res.data)).catch(() => {});
    const interval = setInterval(() => {
      api.get(`/api/restaurantes/${id}/chat/${usuarioId}`).then((res: { data: Mensagem[] }) => setMensagensGeral(res.data)).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [chatGeralAberto, usuarioId]);

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.produto.id === produto.id);
      if (existe) return prev.map((item) => item.produto.id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.produto.id === produtoId);
      if (existe && existe.quantidade > 1) return prev.map((item) => item.produto.id === produtoId ? { ...item, quantidade: item.quantidade - 1 } : item);
      return prev.filter((item) => item.produto.id !== produtoId);
    });
  };

  const abrirModalEndereco = () => { if (carrinho.length === 0) return; setModalEnderecoAberto(true); };

  const finalizarPedido = async () => {
    setFinalizando(true);
    setErroPedido('');
    setModalEnderecoAberto(false);
    try {
      const resposta = await api.post('/api/pedidos', {
        restauranteId: Number(id),
        enderecoEntrega,
        itens: carrinho.map((item) => ({ produtoId: item.produto.id, quantidade: item.quantidade })),
      });
      setCodigoPedido(resposta.data.codigoConfirmacao);
      setPedidoId(resposta.data.id);
      setPedidoFeito(true);
      setCarrinho([]);
      setTemPedido(true);
    } catch {
      setErroPedido('Erro ao finalizar pedido. Tente novamente!');
    } finally {
      setFinalizando(false);
    }
  };

  const enviarAvaliacao = async () => {
    if (!notaSelecionada) return;
    setEnviandoAvaliacao(true);
    try {
      await api.post(`/api/restaurantes/${id}/avaliar`, { nota: notaSelecionada, comentario });
      setAvaliacaoFeita(true);
      setMinhaNotaAtual(notaSelecionada);
      api.get(`/api/restaurantes/${id}/media`).then((res) => setMediaRestaurante(res.data || 0)).catch(() => {});
      setTimeout(() => { setModalAvaliacaoAberto(false); setAvaliacaoFeita(false); }, 2000);
    } catch {
      //pra n dar err nas {}
    } finally { setEnviandoAvaliacao(false); }
  };

  const enviarMensagemPedido = async () => {
    if (!inputMensagemPedido.trim() || !pedidoId || enviandoMsgPedido) return;
    setEnviandoMsgPedido(true);
    try {
      const res = await api.post(`/api/pedidos/${pedidoId}/mensagens`, { texto: inputMensagemPedido.trim(), remetente: 'CLIENTE' });
      setMensagensPedido(prev => [...prev, res.data]);
      setInputMensagemPedido('');
    } catch {
      //pra n dar err nas {}
    } finally { setEnviandoMsgPedido(false); }
  };

  const enviarMensagemGeral = async () => {
    if (!inputMensagemGeral.trim() || !usuarioId || enviandoMsgGeral) return;
    setEnviandoMsgGeral(true);
    try {
      const res = await api.post(`/api/restaurantes/${id}/chat/${usuarioId}`, { texto: inputMensagemGeral.trim(), remetente: 'CLIENTE' });
      setMensagensGeral(prev => [...prev, res.data]);
      setInputMensagemGeral('');
    } catch {
      //pra n dar err nas {}
    } finally { setEnviandoMsgGeral(false); }
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
  const quantidadeTotal = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  if (!restaurante) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontFamily: "'DM Sans', sans-serif" }}>
      Carregando...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 15% 100%, rgba(109, 40, 217, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(109, 40, 217, 0.12) 0%, transparent 50%), #0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

      {/* Modal avaliação */}
      {modalAvaliacaoAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '20px', padding: '1.5rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            {avaliacaoFeita ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⭐</div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>Avaliação enviada!</h2>
                <p style={{ color: '#52525b', fontSize: '0.85rem' }}>Obrigado pelo seu feedback!</p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>Avaliar {restaurante.nome}</h2>
                <p style={{ color: '#52525b', fontSize: '0.85rem', margin: '0 0 1.5rem 0' }}>Como foi sua experiência?</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}
                      onClick={() => setNotaSelecionada(i)}
                      onMouseEnter={() => setNotaHover(i)}
                      onMouseLeave={() => setNotaHover(0)}
                      style={{ fontSize: '2.5rem', cursor: 'pointer', color: i <= (notaHover || notaSelecionada) ? '#fbbf24' : '#27272a', transition: 'all 0.1s', transform: i <= (notaHover || notaSelecionada) ? 'scale(1.2)' : 'scale(1)', display: 'inline-block' }}
                    >★</span>
                  ))}
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Deixe um comentário (opcional)..."
                  rows={3}
                  style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', resize: 'none', marginBottom: '1rem', fontFamily: 'inherit' }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#27272a'}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setModalAvaliacaoAberto(false)}
                    style={{ flex: 1, background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button onClick={enviarAvaliacao} disabled={!notaSelecionada || enviandoAvaliacao}
                    style={{ flex: 1, background: !notaSelecionada || enviandoAvaliacao ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '700', cursor: !notaSelecionada ? 'not-allowed' : 'pointer' }}>
                    {enviandoAvaliacao ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal endereço */}
      {modalEnderecoAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '20px', padding: '1.5rem', maxWidth: '400px', width: '100%' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>📍 Endereço de entrega</h2>
            <p style={{ color: '#52525b', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>Confirme ou edite o endereço antes de finalizar</p>
            <input value={enderecoEntrega} onChange={(e) => setEnderecoEntrega(e.target.value)} placeholder="Rua, número, bairro, cidade"
              style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }}
              onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
              onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setModalEnderecoAberto(false)} style={{ flex: 1, background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={finalizarPedido} disabled={finalizando || !enderecoEntrega.trim()}
                style={{ flex: 1, background: finalizando || !enderecoEntrega.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '700', cursor: finalizando || !enderecoEntrega.trim() ? 'not-allowed' : 'pointer' }}>
                {finalizando ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pedido feito */}
      {pedidoFeito && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '20px', padding: '1.5rem', maxWidth: '420px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>Pedido realizado!</h2>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: 0 }}>Aguarde a confirmação do restaurante</p>
            </div>
            <div style={{ background: '#18181b', border: '1px solid #8b5cf6', borderRadius: '12px', padding: '0.75rem', marginBottom: '1rem', textAlign: 'center' }}>
              <p style={{ color: '#52525b', fontSize: '0.7rem', margin: '0 0 0.2rem 0' }}>Código de confirmação</p>
              <p style={{ color: '#a78bfa', fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '0.5rem' }}>{codigoPedido}</p>
            </div>
            <div style={{ background: '#0d0d11', border: '1px solid #1c1c20', borderRadius: '12px', marginBottom: '1rem', overflow: 'hidden' }}>
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #1c1c20', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💬</span>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#a1a1aa' }}>Chat com o restaurante</p>
              </div>
              <div style={{ height: '150px', overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mensagensPedido.length === 0 && <p style={{ color: '#3f3f46', fontSize: '0.78rem', textAlign: 'center', marginTop: '2rem' }}>Nenhuma mensagem ainda. Diga olá! 👋</p>}
                {mensagensPedido.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.remetente === 'CLIENTE' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: msg.remetente === 'CLIENTE' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.remetente === 'CLIENTE' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b', border: msg.remetente === 'RESTAURANTE' ? '1px solid #27272a' : 'none', fontSize: '0.8rem', color: '#fff' }}>
                      {msg.remetente === 'RESTAURANTE' && <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#8b5cf6', fontWeight: '700' }}>🍽️ Restaurante</p>}
                      {msg.texto}
                    </div>
                  </div>
                ))}
                <div ref={bottomRefPedido} />
              </div>
              <div style={{ padding: '0.5rem', borderTop: '1px solid #1c1c20', display: 'flex', gap: '0.5rem' }}>
                <input value={inputMensagemPedido} onChange={(e) => setInputMensagemPedido(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviarMensagemPedido()} placeholder="Enviar mensagem..."
                  style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }} />
                <button onClick={enviarMensagemPedido} disabled={enviandoMsgPedido || !inputMensagemPedido.trim()}
                  style={{ background: enviandoMsgPedido || !inputMensagemPedido.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>➤</button>
              </div>
            </div>
            <button onClick={() => { setPedidoFeito(false); navigate('/'); }}
              style={{ width: '100%', background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '12px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#8b5cf6'; (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
            >Voltar ao início</button>
          </div>
        </div>
      )}

      {/* Chat geral flutuante */}
      {chatGeralAberto && (
        <div style={{ position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 999, width: '320px', height: '400px', background: '#111114', border: '1px solid #1c1c20', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💬</span>
              <div>
                <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{restaurante.nome}</p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Chat direto</p>
              </div>
            </div>
            <button onClick={() => setChatGeralAberto(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', borderRadius: '6px', padding: '0.2rem 0.5rem', fontWeight: '700' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mensagensGeral.length === 0 && <p style={{ color: '#3f3f46', fontSize: '0.78rem', textAlign: 'center', marginTop: '2rem' }}>Nenhuma mensagem ainda.<br/>Mande uma mensagem pro restaurante! 👋</p>}
            {mensagensGeral.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.remetente === 'CLIENTE' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '0.5rem 0.75rem', borderRadius: msg.remetente === 'CLIENTE' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.remetente === 'CLIENTE' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b', border: msg.remetente === 'RESTAURANTE' ? '1px solid #27272a' : 'none', fontSize: '0.82rem', color: '#fff' }}>
                  {msg.remetente === 'RESTAURANTE' && <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#8b5cf6', fontWeight: '700' }}>🍽️ Restaurante</p>}
                  {msg.texto}
                </div>
              </div>
            ))}
            <div ref={bottomRefGeral} />
          </div>
          <div style={{ padding: '0.75rem', borderTop: '1px solid #1c1c20', display: 'flex', gap: '0.5rem' }}>
            <input value={inputMensagemGeral} onChange={(e) => setInputMensagemGeral(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviarMensagemGeral()} placeholder="Digite sua mensagem..."
              style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }} />
            <button onClick={enviarMensagemGeral} disabled={enviandoMsgGeral || !inputMensagemGeral.trim()}
              style={{ background: enviandoMsgGeral || !inputMensagemGeral.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>➤</button>
          </div>
        </div>
      )}

      {!chatGeralAberto && !delivBotAberto && (
        <button onClick={() => setChatGeralAberto(true)}
          style={{ position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 1000, width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', cursor: 'pointer', fontSize: '1.4rem', boxShadow: '0 4px 24px rgba(139, 92, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >💬</button>
      )}

      {/* Header */}
      <div style={{ background: '#111114', borderBottom: '1px solid #1c1c20', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-3px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; }}
          >← Voltar</button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>Gri</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-1px' }}>ze</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#52525b', fontSize: '0.875rem' }}>{email}</span>
          <button onClick={logout}
            style={{ background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
          >Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '2rem', gap: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ height: '200px', borderRadius: '16px', marginBottom: '1.5rem', overflow: 'hidden', background: restaurante.imagemUrl ? `url(${restaurante.imagemUrl}) center/cover` : 'linear-gradient(135deg, #1c1c20, #27272a)', display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', width: '100%', padding: '1.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>{restaurante.nome}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(139, 92, 246, 0.3)', color: '#a78bfa', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' }}>{restaurante.categoria}</span>
                <span style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>📍 {restaurante.endereco}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: '0.85rem', color: i <= Math.round(mediaRestaurante) ? '#fbbf24' : 'rgba(255,255,255,0.3)' }}>★</span>)}
                  {mediaRestaurante > 0 && <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginLeft: '2px' }}>{mediaRestaurante.toFixed(1)}</span>}
                </div>
                {temPedido && (
                  <button onClick={() => setModalAvaliacaoAberto(true)}
                    style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                    {minhaNotaAtual > 0 ? '✏️ Editar nota' : '⭐ Avaliar'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>🍽️ Cardápio</h2>

          {produtos.filter(p => p.quantidade > 0).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
              <p style={{ fontSize: '2rem' }}>🍽️</p>
              <p>Este restaurante ainda não tem produtos disponíveis</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {produtos.filter(p => p.quantidade > 0).map((produto) => {
                const itemCarrinho = carrinho.find((item) => item.produto.id === produto.id);
                return (
                  <div key={produto.id} style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '14px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '10px', flexShrink: 0, background: produto.imagemUrl ? `url(${produto.imagemUrl}) center/cover` : 'linear-gradient(135deg, #1c1c20, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!produto.imagemUrl && <span style={{ fontSize: '1.5rem' }}>🍔</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', margin: '0 0 0.25rem 0' }}>{produto.nome}</p>
                      <p style={{ color: '#52525b', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>{produto.descricao}</p>
                      <p style={{ color: '#a78bfa', fontWeight: '700', margin: 0 }}>R$ {produto.preco.toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {itemCarrinho ? (
                        <>
                          <button onClick={() => removerDoCarrinho(produto.id)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#a78bfa', cursor: 'pointer', fontSize: '1rem', fontWeight: '700' }}>−</button>
                          <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{itemCarrinho.quantidade}</span>
                          <button onClick={() => adicionarAoCarrinho(produto)} disabled={itemCarrinho.quantidade >= produto.quantidade}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: itemCarrinho.quantidade >= produto.quantidade ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', cursor: itemCarrinho.quantidade >= produto.quantidade ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '700' }}>+</button>
                        </>
                      ) : (
                        <button onClick={() => adicionarAoCarrinho(produto)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Adicionar</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ width: '300px', flexShrink: 0 }}>
          <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '16px', padding: '1.5rem', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 1rem 0' }}>
              🛒 Carrinho {quantidadeTotal > 0 && <span style={{ background: '#8b5cf6', borderRadius: '50%', padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}>{quantidadeTotal}</span>}
            </h3>
            {carrinho.length === 0 ? (
              <p style={{ color: '#52525b', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>Seu carrinho está vazio</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {carrinho.map((item) => (
                    <div key={item.produto.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>{item.produto.nome}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#52525b' }}>x{item.quantidade}</p>
                      </div>
                      <p style={{ margin: 0, fontWeight: '700', color: '#a78bfa', fontSize: '0.875rem' }}>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #27272a', paddingTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700' }}>Total</span>
                    <span style={{ fontWeight: '800', color: '#a78bfa', fontSize: '1.1rem' }}>R$ {totalCarrinho.toFixed(2)}</span>
                  </div>
                </div>
                {erroPedido && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem', textAlign: 'center' }}>{erroPedido}</p>}
                <button onClick={abrirModalEndereco} disabled={finalizando}
                  style={{ width: '100%', background: finalizando ? '#6d28d9' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.875rem', fontSize: '0.875rem', fontWeight: '700', cursor: finalizando ? 'not-allowed' : 'pointer', opacity: finalizando ? 0.7 : 1 }}
                  onMouseEnter={(e) => { if (!finalizando) (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                  onMouseLeave={(e) => { if (!finalizando) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >{finalizando ? 'Enviando...' : 'Finalizar pedido'}</button>
              </>
            )}
          </div>
        </div>
      </div>

      <DelivBot onAbertoChange={(aberto) => setDelivBotAberto(aberto)} />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}