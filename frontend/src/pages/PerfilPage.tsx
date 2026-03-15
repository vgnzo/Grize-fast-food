import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Perfil {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
}

export default function PerfilPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [perfil, setPerfil] = useState<Perfil>({ nome: '', email: '', telefone: '', endereco: '' });
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        api.get('/api/usuarios/perfil').then((res) => setPerfil(res.data)).catch(() => {});
    }, []);

    const salvar = async () => {
        setSalvando(true);
        setErro('');
        setSucesso(false);
        try {
            await api.put('/api/usuarios/perfil', {
                nome: perfil.nome,
                telefone: perfil.telefone,
                endereco: perfil.endereco,
            });
            setSucesso(true);
            setTimeout(() => setSucesso(false), 3000);
        } catch {
            setErro('Erro ao salvar perfil. Tente novamente!');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 10% 80%, rgba(109, 40, 217, 0.12) 0%, transparent 60%), #0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' }}>

            {/* Header */}
            <div style={{ background: '#111114', borderBottom: '1px solid #1c1c20', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => navigate('/')}
    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', color: '#fff', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s, opacity 0.2s' }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(-3px)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateX(0)'; }}
>
    ← Voltar
</button>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>Gri</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-1px' }}>ze</span>
                    </div>
                </div>
                <button onClick={logout}
                    style={{ background: 'transparent', border: '1px solid #27272a', color: '#52525b', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b'; }}
                >
                    Sair
                </button>
            </div>

            <div style={{ maxWidth: '500px', margin: '3rem auto', padding: '0 1.5rem' }}>

                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem auto' }}>
                        👤
                    </div>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 0.25rem 0' }}>{perfil.nome || 'Seu perfil'}</h1>
                    <p style={{ color: '#52525b', fontSize: '0.875rem', margin: 0 }}>{perfil.email}</p>
                </div>

                {/* Formulário */}
                <div style={{ background: '#111114', border: '1px solid #1c1c20', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div>
                        <label style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Nome</label>
                        <input value={perfil.nome} onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })} placeholder="Seu nome completo"
                            style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'} />
                    </div>

                    <div>
                        <label style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                        <input value={perfil.email} disabled
                            style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#52525b', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', cursor: 'not-allowed' }} />
                    </div>

                    <div>
                        <label style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Telefone</label>
                        <input value={perfil.telefone || ''} onChange={(e) => setPerfil({ ...perfil, telefone: e.target.value })} placeholder="(11) 99999-9999"
                            style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'} />
                    </div>

                    <div>
                        <label style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.4rem' }}>Endereço de entrega</label>
                        <input value={perfil.endereco || ''} onChange={(e) => setPerfil({ ...perfil, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade"
                            style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                            onBlur={(e) => e.target.style.borderColor = '#27272a'} />
                    </div>

                    {erro && <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0 }}>{erro}</p>}
                    {sucesso && <p style={{ color: '#34d399', fontSize: '0.8rem', margin: 0 }}>✅ Perfil salvo com sucesso!</p>}

                    <button onClick={salvar} disabled={salvando}
                        style={{ width: '100%', background: salvando ? '#6d28d9' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem', fontSize: '0.9rem', fontWeight: '700', cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1, marginTop: '0.5rem' }}
                    >
                        {salvando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </div>
            </div>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </div>
    );
}