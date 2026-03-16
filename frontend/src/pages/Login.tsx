import { useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
    const { login } = useAuth();

 const handleLogin = async () => {
  setLoading(true);
  try {
    const response = await api.post('/api/auth/login', { email, senha });
    const token = response.data.token;
    
    login(token); // ← salva o token E atualiza o contexto

    const decoded = jwtDecode<{ sub: string; roles?: string[] }>(token);
    const role = decoded.roles?.[0];

    if (role === 'ROLE_RESTAURANTE') {
      window.location.href = '/painel';
    } else {
      window.location.href = '/';
    }
  } catch {
    setErro('Email ou senha incorretos!');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem',
    }}>

      {/* Efeito de luz roxo no fundo */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        top: '-100px',
        right: '-100px',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109, 40, 217, 0.1) 0%, transparent 70%)',
        bottom: '-50px',
        left: '-50px',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#fff',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}>Gri</span>
            <span style={{
              fontSize: '3.5rem',
              fontWeight: '800',
              color: '#8b5cf6',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}>ze</span>
          </div>
          <p style={{ color: '#52525b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Do restaurante até você.
          </p>
        </div>

        {/* Título */}
        <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Entre na sua conta
        </h2>

        {erro && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
          }}>
            {erro}
          </div>
        )}

        {/* Campos */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{
              width: '100%',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '0.875rem 1rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            style={{
              width: '100%',
              background: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '12px',
              padding: '0.875rem 1rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        {/* Botão */}
      <button
            onClick={handleLogin}
            disabled={loading}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
            style={{
              width: '100%',
              background: loading ? '#6d28d9' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.9rem',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.5px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
                      <p style={{ textAlign: 'center', color: '#52525b', fontSize: '0.875rem', marginTop: '1.5rem' }}>
                        Não tem conta?{' '}
                      <a href="/cadastro" style={{ 
                color: '#8b5cf6', 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
                onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#a78bfa'}
                onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#8b5cf6'}
              >
                Cadastre-se
              </a>
        </p>
      </div>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}