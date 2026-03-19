import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { useWebSocket } from '../hooks/useWebSocket';
import ToastNotificacao from '../components/ToastNotificacao';
import DelivBot from '../components/DelivBot';

interface Restaurante {
    id: number;
    nome: string;
    descricao: string;
    categoria: string;
    imagemUrl: string;
    endereco: string;
}

const categorias = ['Todos', 'Lanches', 'Pizza', 'Árabe', 'Japonês', 'Brasileira', 'Vegano', 'Doces'];

const categoriaEmoji: Record<string, string> = {
    Todos: '🍽️', Lanches: '🍔', Pizza: '🍕', Árabe: '🥙',
    Japonês: '🍱', Brasileira: '🍖', Vegano: '🥗', Doces: '🍰',
};

function Estrelas({ media }: { media: number }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ fontSize: '0.75rem', color: i <= Math.round(media) ? '#fbbf24' : '#27272a' }}>★</span>
            ))}
            {media > 0 && <span style={{ fontSize: '0.7rem', color: '#71717a', marginLeft: '2px' }}>{media.toFixed(1)}</span>}
        </div>
    );
}

export default function Home() {
    const { email, logout, usuarioId } = useAuth();
    const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
    const [medias, setMedias] = useState<Record<number, number>>({});
    const [busca, setBusca] = useState('');
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
    const [nomeUsuario, setNomeUsuario] = useState(() => email?.split('@')[0] || '');
    const [notificacao, setNotificacao] = useState<string | null>(null);
    const navigate = useNavigate();

    useWebSocket(usuarioId, (n) => {
        setNotificacao(n.mensagem);
        setTimeout(() => setNotificacao(null), 9000);
    });

    useEffect(() => {
        api.get('/api/restaurantes').then((res) => {
            setRestaurantes(res.data);
            // Busca médias de todos os restaurantes
            res.data.forEach((r: Restaurante) => {
                api.get(`/api/restaurantes/${r.id}/media`)
                    .then((m) => setMedias(prev => ({ ...prev, [r.id]: m.data || 0 })))
                    .catch(() => {});
            });
        });

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<{ roles: string[]; sub: string; nome?: string }>(token);
                if (decoded.roles?.includes('ROLE_RESTAURANTE')) {
                    navigate('/painel');
                }
            } catch {
                //
            }
        }

        api.get('/api/usuarios/perfil').then((res) => {
            if (res.data?.nome) setNomeUsuario(res.data.nome);
        }).catch(() => {});
    }, []);

    const restaurantesFiltrados = restaurantes.filter((r) => {
        const matchBusca = r.nome.toLowerCase().includes(busca.toLowerCase()) ||
            r.categoria.toLowerCase().includes(busca.toLowerCase());
        const matchCategoria = categoriaAtiva === 'Todos' || r.categoria === categoriaAtiva;
        return matchBusca && matchCategoria;
    });

    const saudacao = () => {
        const hora = new Date().getHours();
        if (hora < 12) return 'Bom dia';
        if (hora < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 85% 40%, rgba(109, 40, 217, 0.15) 0%, transparent 60%), #0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

            {/* Header */}
            <div style={{ background: '#111114', borderBottom: '1px solid #1c1c20', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>Gri</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-1px' }}>ze</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/perfil')}
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
                    >👤 Perfil</button>
                    <button onClick={logout}
                        style={{ background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
                    >Sair</button>
                </div>
            </div>

            <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>


                    <button onClick={() => navigate('/meus-pedidos')}
    style={{ background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.25)', color: '#a78bfa', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
    📦 Pedidos
</button>

                {/* Banner */}
                <div style={{ background: '#111114', border: '1px solid #1c1c20', padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                    <p style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>{saudacao()}, {nomeUsuario} 👋</p>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>O que você quer comer hoje?</h1>
                    <p style={{ color: '#52525b', fontSize: '0.875rem', margin: 0 }}>
                        {restaurantes.length} restaurante{restaurantes.length !== 1 ? 's' : ''} disponível{restaurantes.length !== 1 ? 'is' : ''}
                    </p>
                </div>

                {/* Busca */}
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="🔍 Buscar restaurante ou categoria..."
                    style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '0.875rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '1.5rem' }}
                    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                    onBlur={(e) => e.target.style.borderColor = '#27272a'}
                />

                {/* Categorias */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem', paddingTop: '0.4rem' }}>
                    {categorias.map((cat) => (
                        <button key={cat} onClick={() => setCategoriaAtiva(cat)}
                            style={{ flexShrink: 0, background: categoriaAtiva === cat ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b', border: categoriaAtiva === cat ? '1px solid rgba(139, 92, 246, 0.5)' : '1px solid #27272a', color: categoriaAtiva === cat ? '#fff' : '#71717a', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', transform: categoriaAtiva === cat ? 'scale(1.05)' : 'scale(1)' }}
                            onMouseEnter={(e) => { if (categoriaAtiva !== cat) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139, 92, 246, 0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#a78bfa'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; } }}
                            onMouseLeave={(e) => { if (categoriaAtiva !== cat) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#71717a'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; } }}
                        >
                            {categoriaEmoji[cat] || '🍽️'} {cat}
                        </button>
                    ))}
                </div>

                {/* Lista de restaurantes */}
                {restaurantesFiltrados.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#52525b', marginTop: '3rem' }}>
                        <p style={{ fontSize: '2rem' }}>🍽️</p>
                        <p>Nenhum restaurante encontrado</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {restaurantesFiltrados.map((restaurante) => (
                            <div key={restaurante.id} onClick={() => navigate(`/restaurante/${restaurante.id}`)}
                                style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#8b5cf6'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1c1c20'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                            >
                                <div style={{ height: '160px', background: restaurante.imagemUrl ? `url(${restaurante.imagemUrl}) center/cover` : 'linear-gradient(135deg, #1c1c20, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {!restaurante.imagemUrl && <span style={{ fontSize: '3rem' }}>🍽️</span>}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>{restaurante.nome}</h3>
                                    <p style={{ color: '#52525b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{restaurante.descricao}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' }}>
                                            {restaurante.categoria}
                                        </span>
                                        {restaurante.endereco && (
                                            <span style={{ color: '#52525b', fontSize: '0.75rem' }}>📍 {restaurante.endereco}</span>
                                        )}
                                    </div>
                                    <Estrelas media={medias[restaurante.id] || 0} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notificacao && <ToastNotificacao mensagem={notificacao} onClose={() => setNotificacao(null)} />}
            <DelivBot />


                {/* Rodapé */}
<div style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #1c1c20', marginTop: '2rem' }}>
  <p style={{ color: '#27272a', fontSize: '0.75rem' }}>
    Feito por <span style={{ color: '#52525b', fontWeight: '600' }}>Vinicius Galdino</span>
  </p>
</div>


            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </div>
    );
}