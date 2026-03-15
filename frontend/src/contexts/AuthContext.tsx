import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  roles?: string[];
  usuarioId?: number;
}

interface AuthContextType {
  email: string | null;
  role: string | null;
  usuarioId: number | null;
  logout: () => void;
}

function getEmailFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.sub;
  } catch {
    return null;
  }
}


  function getUsuarioIdFromToken(): number | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.usuarioId ?? null;
  } catch {
    return null;
  }
}

function getRoleFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.roles?.[0] ?? null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType>({
  email: null,
  role: null,
  usuarioId: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email] = useState<string | null>(getEmailFromToken);
  const [role] = useState<string | null>(getRoleFromToken);
  const [usuarioId] = useState<number | null>(getUsuarioIdFromToken);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
  <AuthContext.Provider value={{ email, role, usuarioId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}