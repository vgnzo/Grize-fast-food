import { useState, useEffect } from 'react';
import api from '../services/api';
import ProdutosPanel from './ProdutosPanel';
import PedidosPanel from './PedidosPanel';

interface Loja {
  id: number;
  nome: string;
  categoria: string;
  ativo: boolean;
  imagemUrl: string;
}

interface Props {
  onLojaAtiva: (id: number) => void;
}

type AbaLoja = 'informacoes' | 'produtos' | 'pedidos';

export default function LojaPanel({ onLojaAtiva }: Props) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<number | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaLoja>('informacoes');
  const [lojaId, setLojaId] = useState<number | null>(null);
  const [nomeLoja, setNomeLoja] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [endereco, setEndereco] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  const inputStyle = {
    width: '100%', background: '#18181b', border: '1px solid #27272a',
    borderRadius: '10px', padding: '0.75rem 1rem', color: '#fff',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const,
  };

  useEffect(() => {
    api.get('/api/restaurantes/minhas-lojas')
      .then((res: { data: Loja[] }) => setLojas(res.data))
      .catch(() => {});
  }, []);

  const salvarLoja = async () => {
    try {
      if (lojaId) {
        await api.put(`/api/restaurantes/${lojaId}`, {
          nome: nomeLoja, descricao, categoria, imagemUrl, endereco, ativo: true,
        });
      } else {
        await api.post('/api/restaurantes', {
          nome: nomeLoja, descricao, categoria, imagemUrl, endereco, ativo: true,
        });
      }
      setSucesso('Loja salva com sucesso!');
      setErro('');
      const res = await api.get('/api/restaurantes/minhas-lojas');
      setLojas(res.data);
    } catch {
      setErro('Erro ao salvar loja!');
      setSucesso('');
    }
  };

  // Lista de lojas
  if (lojaSelecionada === null) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>🏪 Minhas Lojas</h2>
            <p style={{ color: '#52525b', fontSize: '0.8rem', marginTop: '0.25rem' }}>Gerencie seus restaurantes</p>
          </div>
          <button
            onClick={() => { setLojaId(null); setNomeLoja(''); setDescricao(''); setCategoria(''); setImagemUrl(''); setEndereco(''); setLojaSelecionada(-1); setAbaAtiva('informacoes'); }}
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.6rem 1.2rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
          >
            + Nova loja
          </button>
        </div>

        {lojas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#52525b' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</p>
            <p>Você ainda não tem lojas cadastradas</p>
            <p style={{ fontSize: '0.8rem' }}>Clique em "Nova loja" para começar!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {lojas.map((loja) => (
              <div key={loja.id}
                onClick={() => {
                  setLojaId(loja.id);
                  setLojaSelecionada(loja.id);
                  setAbaAtiva('informacoes');
                  onLojaAtiva(loja.id);
                  api.get(`/api/restaurantes/${loja.id}`).then((res: { data: { nome: string, descricao: string, categoria: string, imagemUrl: string, endereco: string } }) => {
                    setNomeLoja(res.data.nome);
                    setDescricao(res.data.descricao);
                    setCategoria(res.data.categoria);
                    setImagemUrl(res.data.imagemUrl);
                    setEndereco(res.data.endereco);
                  });
                }}
                style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#8b5cf6'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#27272a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ height: '120px', background: loja.imagemUrl ? `url(${loja.imagemUrl}) center/cover` : 'linear-gradient(135deg, #1c1c20, #27272a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!loja.imagemUrl && <span style={{ fontSize: '2rem' }}>🍽️</span>}
                </div>
                <div style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: '700', margin: '0 0 0.25rem 0' }}>{loja.nome}</p>
                  <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' }}>
                    {loja.categoria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dentro da loja selecionada
  return (
    <div>
      {/* Header da loja */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => { setLojaSelecionada(null); setSucesso(''); setErro(''); }}
          style={{ background: 'transparent', border: '1px solid #27272a', color: '#a1a1aa', borderRadius: '8px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          ← Voltar
        </button>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>
          {nomeLoja || 'Nova loja'}
        </h2>
      </div>

      {/* Abas internas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #27272a', paddingBottom: '0' }}>
        {[
          { id: 'informacoes', label: '📋 Informações' },
          { id: 'produtos', label: '🍔 Produtos' },
          { id: 'pedidos', label: '📦 Pedidos' },
        ].map((aba) => (
          <button key={aba.id} onClick={() => setAbaAtiva(aba.id as AbaLoja)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: '600',
              color: abaAtiva === aba.id ? '#a78bfa' : '#52525b',
              borderBottom: abaAtiva === aba.id ? '2px solid #8b5cf6' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* Aba Informações */}
      {abaAtiva === 'informacoes' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Nome do restaurante</label>
              <input type="text" placeholder="Ex: Pizza do João" value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'}>
                <option value="">Selecione...</option>
                <option value="Pizza">🍕 Pizza</option>
                <option value="Lanches">🍔 Lanches</option>
                <option value="Japonês">🍱 Japonês</option>
                <option value="Árabe">🥙 Árabe</option>
                <option value="Brasileira">🍖 Brasileira</option>
                <option value="Vegano">🥗 Vegano</option>
                <option value="Sobremesas">🍰 Sobremesas</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Descrição</label>
              <textarea placeholder="Conte um pouco sobre seu restaurante..." value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
                style={{ ...inputStyle, resize: 'none', fontFamily: "'DM Sans', sans-serif" }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>URL da imagem</label>
              <input type="text" placeholder="https://..." value={imagemUrl} onChange={(e) => setImagemUrl(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: '#a1a1aa', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Endereço</label>
              <input type="text" placeholder="Rua, número, bairro..." value={endereco} onChange={(e) => setEndereco(e.target.value)} style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
            </div>
          </div>

          {erro && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '1rem' }}>{erro}</p>}
          {sucesso && <p style={{ color: '#34d399', fontSize: '0.8rem', marginTop: '1rem' }}>{sucesso}</p>}

          <button onClick={salvarLoja}
            style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
          >
            {lojaId ? 'Atualizar loja' : 'Salvar loja'}
          </button>
        </div>
      )}

      {/* Aba Produtos */}
      {abaAtiva === 'produtos' && (
        <ProdutosPanel lojaAtivaId={lojaId} />
      )}


      {/* Aba Pedidos */}
{abaAtiva === 'pedidos' && (
  <PedidosPanel lojaAtivaId={lojaId} />
)}
    </div>
  );
}