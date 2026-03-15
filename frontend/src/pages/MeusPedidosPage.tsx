import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ItemPedido {
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
}

interface Pedido {
    id: number;
    numeroDia: number;
    restauranteId: number;
    status: string;
    total: number;
    enderecoEntrega: string;
    criadoEm: string;
    itens: ItemPedido[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDENTE:          { label: '⏳ Pendente',          color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)'  },
    CONFIRMADO:        { label: '✅ Confirmado',         color: '#34d399', bg: 'rgba(52, 211, 153, 0.1)'  },
    PREPARANDO:        { label: '👨‍🍳 Preparando',        color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)'  },
    SAIU_PARA_ENTREGA: { label: '🛵 Saiu para entrega', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
    ENTREGUE:          { label: '🎉 Entregue',           color: '#34d399', bg: 'rgba(52, 211, 153, 0.05)' },
    CANCELADO:         { label: '❌ Cancelado',          color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
};

export default function MeusPedidosPage() {
    const navigate = useNavigate();
    const { usuarioId, logout } = useAuth();
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [expandido, setExpandido] = useState<number | null>(null);

    useEffect(() => {
        if (!usuarioId) return;
        api.get(`/api/pedidos/usuario/${usuarioId}`)
            .then((res) => setPedidos(res.data.sort((a: Pedido, b: Pedido) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())))
            .catch(() => {})
            .finally(() => setCarregando(false));
    }, [usuarioId]);

    const formatarData = (criadoEm: string) => {
        const data = new Date(criadoEm);
        return data.toDateString() === new Date().toDateString()
            ? `Hoje às ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : data.toLocaleDateString('pt-BR') + ' às ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 85% 40%, rgba(109, 40, 217, 0.1) 0%, transparent 60%), #0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

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
                <button onClick={logout}
                    style={{ background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
                >Sair</button>
            </div>

            <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 1.5rem 0' }}>📦 Meus Pedidos</h1>

                {carregando ? (
                    <p style={{ color: '#52525b', textAlign: 'center', padding: '3rem' }}>Carregando...</p>
                ) : pedidos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
                        <p style={{ fontSize: '2rem' }}>📭</p>
                        <p>Você ainda não fez nenhum pedido</p>
                        <button onClick={() => navigate('/')}
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer', marginTop: '1rem' }}>
                            Ver restaurantes
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pedidos.map((pedido) => {
                            const config = statusConfig[pedido.status] || statusConfig.PENDENTE;
                            return (
                                <div key={pedido.id} style={{ background: '#111114', border: `1px solid ${config.color}33`, borderRadius: '16px', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{ fontWeight: '800', fontSize: '1rem' }}>
                                                Pedido #{String(pedido.numeroDia ?? pedido.id).padStart(4, '0')}
                                            </span>
                                            <span style={{ background: config.bg, color: config.color, borderRadius: '8px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${config.color}33` }}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <p style={{ color: '#a78bfa', fontWeight: '800', fontSize: '1rem', margin: 0 }}>
                                            R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
                                        </p>
                                    </div>

                                    <p style={{ color: '#52525b', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>
                                        🕐 {formatarData(pedido.criadoEm)}
                                    </p>
                                    {pedido.enderecoEntrega && (
                                        <p style={{ color: '#52525b', fontSize: '0.8rem', margin: '0 0 0.75rem 0' }}>
                                            📍 {pedido.enderecoEntrega}
                                        </p>
                                    )}

                                    <button onClick={() => setExpandido(expandido === pedido.id ? null : pedido.id)}
                                        style={{ background: 'transparent', border: 'none', color: '#52525b', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
                                        {expandido === pedido.id ? '▲ Ocultar itens' : '▼ Ver itens'}
                                    </button>

                                    {expandido === pedido.id && (
                                        <div style={{ background: '#18181b', borderRadius: '10px', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                            {pedido.itens?.map((item, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{item.quantidade}x {item.nomeProduto}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: '700' }}>R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                   <button onClick={() => navigate(`/restaurante/${pedido.restauranteId}`)}
    style={{ marginTop: '1rem', display: 'block', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#a78bfa', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
    🍽️ Ver restaurante
</button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </div>
    );
}