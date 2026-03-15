import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

interface Mensagem {
    role: 'user' | 'bot';
    texto: string;
}

interface Props {
  onAbertoChange?: (aberto: boolean) => void;
}

export default function DelivBot({ onAbertoChange }: Props) {
    const [aberto, setAberto] = useState(false);
    const [mensagens, setMensagens] = useState<Mensagem[]>([
      { role: 'bot', texto: 'Olá! Sou o DelivBot 🤖 Como posso te ajudar hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensagens]);

    const style = document.createElement('style');
    style.textContent = `@keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`;
    document.head.appendChild(style);

    const enviar = async () => {
        if (!input.trim() || carregando) return;
        const texto = input.trim();
        setInput('');
        setMensagens(prev => [...prev, { role: 'user', texto }]);
        setCarregando(true);
        try {
            const res = await api.post('/api/chat/mensagem', { mensagem: texto, sessionId });
            setMensagens(prev => [...prev, { role: 'bot', texto: res.data.resposta }]);
        } catch {
            setMensagens(prev => [...prev, { role: 'bot', texto: 'Desculpe, tive um problema. Tente novamente!' }]);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <>
            <button
                onClick={() => {
                    const novoEstado = !aberto;
                    setAberto(novoEstado);
                    onAbertoChange?.(novoEstado);
                }}
                style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: 'none', cursor: 'pointer', fontSize: '1.5rem',
                    boxShadow: '0 4px 24px rgba(139, 92, 246, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                {aberto ? '✕' : '🤖'}
            </button>

            {aberto && (
                <div style={{
                    position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 999,
                    width: '320px', height: '420px',
                    background: '#111114', border: '1px solid #1c1c20',
                    borderRadius: '20px', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                    fontFamily: "'DM Sans', sans-serif",
                    overflow: 'hidden',
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🤖</span>
                        <div>
                            <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>DelivBot</p>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Assistente virtual</p>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {mensagens.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '80%',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : '#18181b',
                                    border: msg.role === 'bot' ? '1px solid #27272a' : 'none',
                                    color: '#fff',
                                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    padding: '0.6rem 0.875rem',
                                    fontSize: '0.82rem', lineHeight: '1.4',
                                }}>
                                    {msg.texto}
                                </div>
                            </div>
                        ))}

                        {carregando && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '14px 14px 14px 4px', padding: '0.6rem 0.875rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#8b5cf6', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div style={{ padding: '0.75rem', borderTop: '1px solid #1c1c20', display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && enviar()}
                            placeholder="Digite sua mensagem..."
                            style={{ flex: 1, background: '#18181b', border: '1px solid #27272a', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
                        />
                        <button onClick={enviar} disabled={carregando || !input.trim()}
                            style={{ background: carregando || !input.trim() ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)', border: 'none', borderRadius: '10px', padding: '0.6rem 0.875rem', color: '#fff', cursor: carregando || !input.trim() ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                        >➤</button>
                    </div>
                </div>
            )}

            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </>
    );
}