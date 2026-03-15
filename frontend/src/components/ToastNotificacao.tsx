interface Props {
  mensagem: string;
  onClose: () => void;
}

export default function ToastNotificacao({ mensagem, onClose }: Props) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: '#18181b',
      border: '1px solid #8b5cf6',
      borderRadius: '14px',
      padding: '1rem 1.25rem',
      color: '#fff',
      fontSize: '0.875rem',
      fontWeight: '600',
      zIndex: 9999,
      maxWidth: '320px',
      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: '1.2rem' }}>🔔</span>
      <p style={{ margin: 0, flex: 1 }}>{mensagem}</p>
      <button onClick={onClose} style={{
        background: 'transparent',
        border: 'none',
        color: '#52525b',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: 0,
      }}>✕</button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}