import { createContext, useContext, useState, useCallback } from 'react';
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
  login: (token: string) => void;
  logout: () => void;
}

function decodeToken(token: string | null) {
  if (!token) return { email: null, role: null, usuarioId: null };
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return {
      email: decoded.sub,
      role: decoded.roles?.[0] ?? null,
      usuarioId: decoded.usuarioId ?? null,
    };
  } catch {
    return { email: null, role: null, usuarioId: null };
  }
}

const AuthContext = createContext<AuthContextType>({
  email: null,
  role: null,
  usuarioId: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(() =>
    decodeToken(localStorage.getItem('token'))
  );

  const login = useCallback((token: string) => {
    localStorage.setItem('token', token);
    setAuthState(decodeToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({ email: null, role: null, usuarioId: null });
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}