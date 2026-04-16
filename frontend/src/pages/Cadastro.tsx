import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { IMaskInput } from 'react-imask';

export default function Cadastro() {
  const [tipo, setTipo] = useState<'CLIENTE' | 'RESTAURANTE'>('CLIENTE');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const navigate = useNavigate();

  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      setBuscandoCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setEndereco(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);
        } else {
          setErro('CEP não encontrado!');
        }
      } catch {
        setErro('Erro ao buscar CEP!');
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  const handleCadastro = async () => {
  setLoading(true);
  try {
    await api.post('/api/auth/cadastro', {
      nome,
      email,
      senha,
      telefone,
      endereco,
      role: tipo,
    });
    navigate('/login');
} catch (error: unknown) {
  const axiosError = error as { response?: { status?: number } };
  if (axiosError.response?.status === 400 || axiosError.response?.status === 500) {
    setErro('Este email já está cadastrado!');
  } else {
    setErro('Erro ao cadastrar. Verifique os dados!');
  }
} finally {
  setLoading(false);

}
};

  const inputStyle = {
    width: '100%',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '0.875rem 1rem',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
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
      padding: '2rem 1rem',
    }}>

      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        top: '-100px', right: '-100px', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109, 40, 217, 0.1) 0%, transparent 70%)',
        bottom: '-50px', left: '-50px', pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>Gri</span>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#8b5cf6', letterSpacing: '-2px', lineHeight: 1 }}>ze</span>
          </div>
          <p style={{ color: '#52525b', fontSize: '0.875rem', marginTop: '0.5rem' }}>Crie sua conta gratuitamente</p>
        </div>

        {/* Abas */}
        <div style={{
          display: 'flex', background: '#18181b', borderRadius: '12px',
          padding: '4px', marginBottom: '1.5rem', border: '1px solid #27272a',
        }}>
          {(['CLIENTE', 'RESTAURANTE'] as const).map((t) => (
            <button key={t} onClick={() => setTipo(t)} style={{
              flex: 1, padding: '0.6rem', borderRadius: '9px', border: 'none',
              background: tipo === t ? '#8b5cf6' : 'transparent',
              color: tipo === t ? '#fff' : '#52525b',
              fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {t === 'CLIENTE' ? '🛵 Cliente' : '🍽️ Restaurante'}
            </button>
          ))}
        </div>

        {erro && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171', borderRadius: '12px', padding: '0.75rem 1rem',
            marginBottom: '1rem', fontSize: '0.875rem',
          }}>
            {erro}
          </div>
        )}

        {/* Nome */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text" value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder={tipo === 'CLIENTE' ? 'Seu nome' : 'Nome do responsável'}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        {/* Senha */}
<div style={{ marginBottom: '0.75rem', position: 'relative' }}>
  <input
    type={mostrarSenha ? 'text' : 'password'}
    value={senha} onChange={(e) => setSenha(e.target.value)}
    placeholder="Senha"
    style={{ ...inputStyle, paddingRight: '3rem' }}
    onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
    onBlur={(e) => e.target.style.borderColor = '#27272a'}
  />
  <button onClick={() => setMostrarSenha(!mostrarSenha)}
    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', fontSize: '1rem', padding: 0 }}>
    {mostrarSenha ? '🙈' : '👁️'}
  </button>
</div>
{/* Telefone com máscara */}
<div style={{ marginBottom: '0.75rem' }}>
  <IMaskInput
    mask="(00) 00000-0000"
    value={telefone}
    onAccept={(value: string) => setTelefone(value)}
    placeholder="Telefone"
    style={inputStyle}
    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#8b5cf6'}
    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#27272a'}
  />
</div>

{/* CEP */}
<div style={{ marginBottom: '0.75rem' }}>
  <IMaskInput
    mask="00000-000"
    value={cep}
    onAccept={(value: string) => {
      setCep(value);
      buscarCep(value);
    }}
    placeholder={buscandoCep ? 'Buscando CEP...' : 'CEP'}
    style={inputStyle}
    onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#8b5cf6'}
    onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#27272a'}
  />
</div>

        {/* Endereço preenchido automaticamente */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço (preenchido pelo CEP)"
            style={{ ...inputStyle, color: endereco ? '#a78bfa' : '#52525b' }}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        <button
          onClick={handleCadastro}
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
            color: '#fff', border: 'none', borderRadius: '12px', padding: '0.9rem',
            fontSize: '0.9rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px', transition: 'transform 0.2s, box-shadow 0.2s',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Cadastrando...' : 'Criar conta'}
        </button>

        <p style={{ textAlign: 'center', color: '#52525b', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Já tem conta?{' '}
          <a href="/login" style={{ color: '#8b5cf6', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#a78bfa'}
            onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#8b5cf6'}
          >
            Entrar
          </a>
        </p>

        <p style={{ textAlign: 'center', color: '#27272a', fontSize: '0.75rem', marginTop: '1rem' }}>
          Feito por <span style={{ color: '#52525b', fontWeight: '600' }}>Vinicius Galdino</span>
        </p>

      </div>  {/* ← fecha o div central */}

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
    </div>
  );
}