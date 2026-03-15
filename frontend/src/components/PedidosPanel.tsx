import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Props {
  lojaAtivaId: number | null;
}

interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

interface Pedido {
  id: number;
  numeroDia: number;
  usuarioId: number;
  restauranteId: number;
  status: Status;
  total: number;
  enderecoEntrega: string;
  criadoEm: string;
  itens: ItemPedido[];
}

interface Mensagem {
  id: number;
  remetente: string;
  texto: string;
  criadoEm: string;
}

type Status = 'PENDENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

const proximoStatus: Record<string, Status | null> = {
  PENDENTE: 'CONFIRMADO',
  CONFIRMADO: 'PREPARANDO',
  PREPARANDO: 'SAIU_PARA_ENTREGA',
  SAIU_PARA_ENTREGA: 'ENTREGUE',
  ENTREGUE: null,
  CANCELADO: null,
};

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  PENDENTE:          { label: '⏳ Pendente',          color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)'  },
  CONFIRMADO:        { label: '✅ Confirmado',         color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)'  },
  PREPARANDO:        { label: '👨‍🍳 Preparando',        color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)'  },
  SAIU_PARA_ENTREGA: { label: '🛵 Saiu para entrega', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
  ENTREGUE:          { label: '🎉 Entregue',           color: '#34d399', bg: 'rgba(52, 211, 153, 0.05)' },
  CANCELADO:         { label: '❌ Cancelado',          color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
};

const botaoLabel: Record<string, string> = {
  PENDENTE:          'Confirmar pedido',
  CONFIRMADO:        'Iniciar preparo',
  PREPARANDO:        'Saiu para entrega',
  SAIU_PARA_ENTREGA: 'Marcar como entregue',
};

const filtroConfig: { value: Status | 'TODOS'; label: string }[] = [
  { value: 'TODOS',             label: 'Todos' },
  { value: 'PENDENTE',          label: '⏳ Pendentes' },
  { value: 'CONFIRMADO',        label: '✅ Confirmados' },
  { value: 'PREPARANDO',        label: '👨‍🍳 Preparando' },
  { value: 'SAIU_PARA_ENTREGA', label: '🛵 Em entrega' },
  { value: 'ENTREGUE',          label: '🎉 Entregues' },
  { value: 'CANCELADO',         label: '❌ Cancelados' },
];

export default function PedidosPanel({ lojaAtivaId }: Props) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [codigoInput, setCodigoInput] = useState<Record<number, string>>({});
  const [erroCodigoInput, setErroCodigoInput] = useState<Record<number, string>>({});
  const [filtro, setFiltro] = useState<Status | 'TODOS'>('TODOS');
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<number | null>(null);
  const [chatAberto, setChatAberto] = useState<number | null>(null);
  const [mensagens, setMensagens] = useState<Record<number, Mensagem[]>>({});
  const [inputMensagem, setInputMensagem] = useState<Record<number, string>>({});
  const [enviandoMsg, setEnviandoMsg] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lojaAtivaId) return;
    setCarregando(true);
    api.get(`/api/pedidos/restaurante/${lojaAtivaId}`)
      .then((res: { data: Pedido[] }) => setPedidos(res.data))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [lojaAtivaId]);

  useEffect(() => {
    if (!chatAberto) return;
    const interval = setInterval(() => {
      api.get(`/api/pedidos/${chatAberto}/mensagens`)
        .then((res: { data: Mensagem[] }) => setMensagens(prev => ({ ...prev, [chatAberto]: res.data })))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [chatAberto]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens, chatAberto]);

  const abrirChat = (pedidoId: number) => {
    if (chatAberto === pedidoId) { setChatAberto(null); return; }
    setChatAberto(pedidoId);
    api.get(`/api/pedidos/${pedidoId}/mensagens`)
      .then((res: { data: Mensagem[] }) => setMensagens(prev => ({ ...prev, [pedidoId]: res.data })))
      .catch(() => {});
  };

  const enviarMensagem = async (pedidoId: number) => {
    const texto = inputMensagem[pedidoId]?.trim();
    if (!texto || enviandoMsg) return;
    setEnviandoMsg(true);
    try {
      const res = await api.post(`/api/pedidos/${pedidoId}/mensagens`, { texto, remetente: 'RESTAURANTE' });
      setMensagens(prev => ({ ...prev, [pedidoId]: [...(prev[pedidoId] || []), res.data] }));
      setInputMensagem(prev => ({ ...prev, [pedidoId]: '' }));
    } catch {
      //pra n dar erro
    } finally {
      setEnviandoMsg(false);
    }
  };

  const avancarStatus = async (pedidoId: number, statusAtual: Status) => {
    const novoStatus = proximoStatus[statusAtual];
    if (!novoStatus) return;
    setAtualizando(pedidoId);
    try {
      await api.patch(`/api/pedidos/${pedidoId}/status?status=${novoStatus}`);
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
    } catch { alert('Erro ao atualizar status!'); }
    finally { setAtualizando(null); }
  };

  const cancelarPedido = async (pedidoId: number, statusAtual: Status) => {
    if (statusAtual === 'ENTREGUE' || statusAtual === 'CANCELADO') return;
    setAtualizando(pedidoId);
    try {
      await api.patch(`/api/pedidos/${pedidoId}/status?status=CANCELADO`);
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'CANCELADO' } : p));
    } catch { alert('Erro ao cancelar pedido!'); }
    finally { setAtualizando(null); }
  };

  const confirmarEntrega = async (pedidoId: number, codigo: string) => {
    setAtualizando(pedidoId);
    try {
      await api.post(`/api/pedidos/${pedidoId}/confirmar-entrega?codigo=${codigo}`);
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'ENTREGUE' } : p));
      setErroCodigoInput(prev => ({ ...prev, [pedidoId]: '' }));
    } catch {
      setErroCodigoInput(prev => ({ ...prev, [pedidoId]: 'Código inválido!' }));
    } finally { setAtualizando(null); }
  };

  const formatarHora = (criadoEm: string) => new Date(criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const formatarData = (criadoEm: string) => {
    const data = new Date(criadoEm);
    return data.toDateString() === new Date().toDateString() ? 'Hoje' : data.toLocaleDateString('pt-BR');
  };

  const pedidosFiltrados = filtro === 'TODOS' ? pedidos : pedidos.filter(p => p.status === filtro);
  const diasDisponiveis = [...new Set(pedidos.map(p => p.criadoEm.split('T')[0]))].sort().reverse();
  const pedidosDoDia = diaSelecionado ? pedidosFiltrados.filter(p => p.criadoEm.startsWith(diaSelecionado)) : pedidosFiltrados;

  if (!lojaAtivaId) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
      <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</p>
      <p>Vá até Minha Loja e selecione uma loja para ver os pedidos</p>
    </div>
  );

  if (carregando) return <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>Carregando pedidos...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>📦 Pedidos</h2>
          <p style={{ color: '#52525b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {pedidos.length === 0 ? 'Nenhum pedido ainda' : `${pedidos.length} pedido${pedidos.length > 1 ? 's' : ''} recebido${pedidos.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => { setCarregando(true); api.get(`/api/pedidos/restaurante/${lojaAtivaId}`).then((res: { data: Pedido[] }) => setPedidos(res.data)).catch(() => {}).finally(() => setCarregando(false)); }}
          style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#a78bfa', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
          🔄 Atualizar
        </button>
      </div>

      {diasDisponiveis.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <input type="date" value={diaSelecionado ?? ''} onChange={(e) => setDiaSelecionado(e.target.value || null)}
            style={{ background: '#18181b', border: '1px solid #27272a', color: '#a1a1aa', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', outline: 'none' }} />
          {diaSelecionado && (
            <button onClick={() => setDiaSelecionado(null)} style={{ marginLeft: '0.5rem', background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', fontSize: '0.8rem' }}>✕ Limpar</button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {filtroConfig.map(({ value, label }) => {
          const count = value === 'TODOS' ? pedidos.length : pedidos.filter(p => p.status === value).length;
          const ativo = filtro === value;
          return (
            <button key={value} onClick={() => setFiltro(value)}
              style={{ background: ativo ? 'rgba(139, 92, 246, 0.2)' : 'transparent', border: ativo ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid #27272a', color: ativo ? '#a78bfa' : '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {label}
              {count > 0 && <span style={{ background: ativo ? '#8b5cf6' : '#27272a', borderRadius: '10px', padding: '0.05rem 0.4rem', fontSize: '0.7rem' }}>{count}</span>}
            </button>
          );
        })}
      </div>

      {pedidosDoDia.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
          <p>{pedidos.length === 0 ? 'Nenhum pedido recebido ainda' : 'Nenhum pedido com esse filtro'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pedidosDoDia.map((pedido) => {
            const config = statusConfig[pedido.status];
            const proximo = proximoStatus[pedido.status];
            const estaAtualizando = atualizando === pedido.id;
            const msgsPedido = mensagens[pedido.id] || [];
            const chatEstaAberto = chatAberto === pedido.id;

            return (
              <div key={pedido.id} style={{ background: '#18181b', border: `1px solid ${config.color}33`, borderRadius: '14px', padding: '1.25rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: '800', fontSize: '1rem' }}>Pedido #{String(pedido.numeroDia ?? pedido.id).padStart(4, '0')}</span>
                    <span style={{ background: config.bg, color: config.color, borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${config.color}33` }}>{config.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: '#52525b', fontSize: '0.75rem', margin: 0 }}>{formatarData(pedido.criadoEm)}</p>
                    <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0, fontWeight: '600' }}>{formatarHora(pedido.criadoEm)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: '#52525b', fontSize: '0.8rem', margin: 0 }}>📍 {pedido.enderecoEntrega || 'Endereço não informado'}</p>
                  <p style={{ color: '#a78bfa', fontWeight: '800', fontSize: '1rem', margin: 0 }}>R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</p>
                </div>

                {/* Itens */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <button onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                    style={{ background: 'transparent', border: 'none', color: '#52525b', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                    {expandido === pedido.id ? '▲ Ocultar itens' : '▼ Ver itens'}
                  </button>
                  {expandido === pedido.id && (
                    <div style={{ background: '#111114', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                      {pedido.itens?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{item.quantidade}x {item.nomeProduto}</span>
                          <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: '700' }}>R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <button onClick={() => abrirChat(pedido.id)}
                    style={{ background: chatEstaAberto ? 'rgba(139, 92, 246, 0.15)' : 'transparent', border: chatEstaAberto ? '1px solid rgba(139, 92, 246, 0.3)' : 'none', color: chatEstaAberto ? '#a78bfa' : '#52525b', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: chatEstaAberto ? '0.2rem 0.6rem' : '0', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    💬 {chatEstaAberto ? 'Fechar chat' : `Chat${msgsPedido.length > 0 ? ` (${msgsPedido.length})` : ''}`}
                  </button>

                  {chatEstaAberto && (
                    <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '12px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ height: '150px', overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {msgsPedido.length === 0 && <p style={{ color: '#3f3f46', fontSize: '0.78rem', textAlign: 'center', marginTop: '2rem' }}>Nenhuma mensagem ainda</p>}
                        {msgsPedido.map((msg) => (
                          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.remetente === 'RESTAURANTE' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '80%', padding: '0.5rem 0.75rem',
                              borderRadius: msg.remetente === 'RESTAURANTE' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                              background: msg.remetente === 'RESTAURANTE' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b',
                              border: msg.remetente === 'CLIENTE' ? '1px solid #27272a' : 'none',
                              fontSize: '0.8rem', color: '#fff',
                            }}>
                              {msg.remetente === 'CLIENTE' && <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#a78bfa', fontWeight: '700' }}>👤 Cliente</p>}
                              {msg.texto}
                            </div>
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                      <div style={{ padding: '0.5rem', borderTop: '1px solid #1c1c20', display: 'flex', gap: '0.5rem' }}>
                        <input
                          value={inputMensagem[pedido.id] || ''}
                          onChange={(e) => setInputMensagem(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && enviarMensagem(pedido.id)}
                          placeholder="Enviar mensagem..."
                          style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button onClick={() => enviarMensagem(pedido.id)} disabled={enviandoMsg || !inputMensagem[pedido.id]?.trim()}
                          style={{ background: enviandoMsg || !inputMensagem[pedido.id]?.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>
                          ➤
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {pedido.status === 'SAIU_PARA_ENTREGA' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="text" maxLength={4} placeholder="Código do cliente" value={codigoInput[pedido.id] || ''}
                            onChange={(e) => setCodigoInput(prev => ({ ...prev, [pedido.id]: e.target.value }))}
                            style={{ flex: 1, background: '#111114', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 1rem', color: '#fff', fontSize: '0.875rem', outline: 'none', letterSpacing: '0.3rem', fontWeight: '700' }} />
                          <button onClick={() => confirmarEntrega(pedido.id, codigoInput[pedido.id] || '')} disabled={estaAtualizando || !codigoInput[pedido.id]}
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                            Confirmar
                          </button>
                        </div>
                        {erroCodigoInput[pedido.id] && <p style={{ color: '#f87171', fontSize: '0.75rem', margin: 0 }}>{erroCodigoInput[pedido.id]}</p>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {proximo && (
                          <button onClick={() => avancarStatus(pedido.id, pedido.status)} disabled={estaAtualizando}
                            style={{ flex: 1, background: estaAtualizando ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: estaAtualizando ? 'not-allowed' : 'pointer', opacity: estaAtualizando ? 0.6 : 1 }}>
                            {estaAtualizando ? 'Atualizando...' : botaoLabel[pedido.status]}
                          </button>
                        )}
                        <button onClick={() => cancelarPedido(pedido.id, pedido.status)} disabled={estaAtualizando}
                          style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', color: '#f87171', borderRadius: '10px', padding: '0.6rem 1rem', fontSize: '0.8rem', fontWeight: '700', cursor: estaAtualizando ? 'not-allowed' : 'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}