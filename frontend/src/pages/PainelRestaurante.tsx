import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LojaPanel from '../components/LojaPanel';
import api from '../services/api';

type MenuAtivo = 'loja' | 'pedidos' | 'mensagens';

interface Resumo {
  pedidosHoje: number;
  produtosAtivos: number;
  receitaHoje: number;
}

interface Mensagem {
  id: number;
  remetente: string;
  texto: string;
  criadoEm: string;
}

interface Conversa {
  usuarioId: number;
  nomeUsuario: string;
  ultimaMensagem: string;
  mensagens: Mensagem[];
}

export default function PainelRestaurante() {
  const [menuAtivo, setMenuAtivo] = useState<MenuAtivo>('loja');
  const { email, logout } = useAuth();
  const [lojaAtivaId, setLojaAtivaId] = useState<number | null>(null);
  const [resumo, setResumo] = useState<Resumo>({ pedidosHoje: 0, produtosAtivos: 0, receitaHoje: 0 });
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtiva, setConversaAtiva] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState('');
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lojaAtivaId) return;

    api.get(`/api/produtos/restaurante/${lojaAtivaId}`)
      .then((res: { data: { quantidade: number }[] }) => {
        const ativos = res.data.filter(p => p.quantidade > 0).length;
        setResumo(prev => ({ ...prev, produtosAtivos: ativos }));
      }).catch(() => {});

    api.get(`/api/pedidos/restaurante/${lojaAtivaId}`)
      .then((res: { data: { total: number; criadoEm: string }[] }) => {
        const hoje = new Date().toISOString().slice(0, 10);
        const pedidosHoje = res.data.filter(p => p.criadoEm?.slice(0, 10) === hoje);
        const receitaHoje = pedidosHoje.reduce((acc, p) => acc + (p.total || 0), 0);
        setResumo(prev => ({ ...prev, pedidosHoje: pedidosHoje.length, receitaHoje }));
      }).catch(() => {});
  }, [lojaAtivaId]);

  // Busca conversas dos pedidos para identificar usuários que mandaram mensagem
  useEffect(() => {
    if (!lojaAtivaId || menuAtivo !== 'mensagens') return;

    api.get(`/api/restaurantes/${lojaAtivaId}/chat/usuarios`)
      .then(async (res: { data: number[] }) => {
        const novasConversas: Conversa[] = [];
     for (const usuarioId of res.data) {
  try {
    const msgs = await api.get(`/api/restaurantes/${lojaAtivaId}/chat/${usuarioId}`);
    const usuario = await api.get(`/api/usuarios/${usuarioId}`);
    if (msgs.data.length > 0) {
      novasConversas.push({
        usuarioId,
        nomeUsuario: usuario.data.nome || `Cliente #${usuarioId}`,
        ultimaMensagem: msgs.data[msgs.data.length - 1].texto,
        mensagens: msgs.data,
      });
    }
          } catch { 

            //pra n dar erro nas {}
          }
        }
        setConversas(novasConversas);
      }).catch(() => {});
  }, [lojaAtivaId, menuAtivo]);

  // Polling da conversa ativa
  useEffect(() => {
    if (!conversaAtiva || !lojaAtivaId) return;
    const interval = setInterval(() => {
      api.get(`/api/restaurantes/${lojaAtivaId}/chat/${conversaAtiva}`)
        .then((res: { data: Mensagem[] }) => {
          setConversas(prev => prev.map(c => c.usuarioId === conversaAtiva ? { ...c, mensagens: res.data, ultimaMensagem: res.data[res.data.length - 1]?.texto || '' } : c));
        }).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [conversaAtiva, lojaAtivaId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversaAtiva, conversas]);

  const enviarMensagem = async () => {
    if (!inputMsg.trim() || !conversaAtiva || !lojaAtivaId || enviando) return;
    setEnviando(true);
    try {
      const res = await api.post(`/api/restaurantes/${lojaAtivaId}/chat/${conversaAtiva}`, { texto: inputMsg.trim(), remetente: 'RESTAURANTE' });
      setConversas(prev => prev.map(c => c.usuarioId === conversaAtiva ? { ...c, mensagens: [...c.mensagens, res.data], ultimaMensagem: res.data.texto } : c));
      setInputMsg('');
    } catch {
      //pra n dar erro nas {}
    } finally { setEnviando(false); }
  };

  const conversaAtivaObj = conversas.find(c => c.usuarioId === conversaAtiva);

  const menuItems = [
    { id: 'loja', label: 'Minha Loja', emoji: '🏪', desc: 'Configurações da loja' },
    { id: 'mensagens', label: 'Mensagens', emoji: '💬', desc: 'Chat com clientes' },
  ];

  const cards = [
    { label: 'Pedidos hoje', value: resumo.pedidosHoje.toString(), emoji: '📦' },
    { label: 'Produtos ativos', value: resumo.produtosAtivos.toString(), emoji: '🍔' },
    { label: 'Receita hoje', value: `R$ ${resumo.receitaHoje.toFixed(2).replace('.', ',')}`, emoji: '💰' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

      <div style={{ position: 'fixed', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ background: 'rgba(17, 17, 20, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1c1c20', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>Gri</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-1px' }}>ze</span>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', color: '#a78bfa', fontWeight: '600', letterSpacing: '0.5px' }}>RESTAURANTE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: '#52525b', margin: 0 }}>Logado como</p>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0, fontWeight: '600' }}>{email}</p>
          </div>
          <button onClick={logout}
            style={{ background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
          >Sair</button>
        </div>
      </div>

      <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* Menu lateral */}
        <div style={{ width: '240px', minHeight: 'calc(100vh - 61px)', background: '#0d0d11', borderRight: '1px solid #1c1c20', padding: '1.5rem 1rem', position: 'sticky', top: '61px', height: 'calc(100vh - 61px)' }}>
          <p style={{ color: '#3f3f46', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '0.5rem' }}>MENU</p>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setMenuAtivo(item.id as MenuAtivo)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left', background: menuAtivo === item.id ? 'rgba(139, 92, 246, 0.12)' : 'transparent', border: menuAtivo === item.id ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid transparent', color: menuAtivo === item.id ? '#a78bfa' : '#52525b', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', marginBottom: '0.4rem', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { if (menuAtivo !== item.id) { (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; } }}
              onMouseLeave={(e) => { if (menuAtivo !== item.id) { (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, fontWeight: '400' }}>{item.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Área principal */}
        <div style={{ flex: 1, padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {cards.map((card) => (
              <div key={card.label} style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '14px', padding: '1.25rem' }}>
                <p style={{ color: '#52525b', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>{card.emoji} {card.label}</p>
                <p style={{ color: lojaAtivaId ? '#fff' : '#3f3f46', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  {lojaAtivaId ? card.value : '—'}
                </p>
                {!lojaAtivaId && <p style={{ color: '#3f3f46', fontSize: '0.7rem', margin: '0.25rem 0 0 0' }}>Selecione uma loja</p>}
              </div>
            ))}
          </div>

          <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '16px', padding: '1.5rem' }}>
            {menuAtivo === 'loja' && <LojaPanel onLojaAtiva={(id) => setLojaAtivaId(id)} />}

            {menuAtivo === 'mensagens' && (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>💬 Mensagens</h2>

                {!lojaAtivaId ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
                    <p style={{ fontSize: '2rem' }}>🏪</p>
                    <p>Selecione uma loja primeiro</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '1rem', height: '500px' }}>

                    {/* Lista de conversas */}
                    <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
                      {conversas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#52525b' }}>
                          <p style={{ fontSize: '1.5rem' }}>💬</p>
                          <p style={{ fontSize: '0.8rem' }}>Nenhuma mensagem ainda</p>
                        </div>
                      ) : (
                        conversas.map((c) => (
                          <button key={c.usuarioId} onClick={() => setConversaAtiva(c.usuarioId)}
                            style={{ background: conversaAtiva === c.usuarioId ? 'rgba(139, 92, 246, 0.15)' : '#18181b', border: conversaAtiva === c.usuarioId ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid #27272a', borderRadius: '12px', padding: '0.75rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>👤</div>
                              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: conversaAtiva === c.usuarioId ? '#a78bfa' : '#a1a1aa' }}>{c.nomeUsuario}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.ultimaMensagem}</p>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Chat */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0d0d11', borderRadius: '12px', border: '1px solid #1c1c20', overflow: 'hidden' }}>
                      {!conversaAtiva ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', flexDirection: 'column', gap: '0.5rem' }}>
                          <p style={{ fontSize: '2rem' }}>👈</p>
                          <p style={{ fontSize: '0.85rem' }}>Selecione uma conversa</p>
                        </div>
                      ) : (
                        <>
                          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1c1c20' }}>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem' }}>👤 {conversaAtivaObj?.nomeUsuario}</p>
                          </div>
                          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {conversaAtivaObj?.mensagens.map((msg) => (
                              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.remetente === 'RESTAURANTE' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '75%', padding: '0.5rem 0.75rem', borderRadius: msg.remetente === 'RESTAURANTE' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.remetente === 'RESTAURANTE' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b', border: msg.remetente === 'CLIENTE' ? '1px solid #27272a' : 'none', fontSize: '0.82rem', color: '#fff' }}>
                                  {msg.remetente === 'CLIENTE' && <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.7rem', color: '#a78bfa', fontWeight: '700' }}>👤 Cliente</p>}
                                  {msg.texto}
                                </div>
                              </div>
                            ))}
                            <div ref={bottomRef} />
                          </div>
                          <div style={{ padding: '0.75rem', borderTop: '1px solid #1c1c20', display: 'flex', gap: '0.5rem' }}>
                            <input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()} placeholder="Responder cliente..."
                              style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }} />
                            <button onClick={enviarMensagem} disabled={enviando || !inputMsg.trim()}
                              style={{ background: enviando || !inputMsg.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>➤</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}