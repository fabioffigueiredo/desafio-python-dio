import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, LoginRequest, RegisterBackendRequest } from '../types';
import { apiService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (cpf: string, senha: string): Promise<{ redirectTo: string }> => {
    try {
      setLoading(true);
      const authResponse = await apiService.login({ cpf, senha });
      
      // Salvar token
      localStorage.setItem('token', authResponse.access_token);
      setToken(authResponse.access_token);

      // Buscar dados do usuário
      const userData = await apiService.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Verificar número de contas após login bem-sucedido
      try {
        const contas = await apiService.getContas();
        const contasAtivas = contas.filter(conta => conta.ativa);
        
        if (contasAtivas.length === 0) {
          // Usuário não tem contas, redirecionar para criação de conta
          return { redirectTo: '/contas' };
        } else if (contasAtivas.length === 1) {
          // Usuário tem apenas uma conta, selecionar automaticamente
          localStorage.setItem('selectedAccount', JSON.stringify(contasAtivas[0]));
          return { redirectTo: '/dashboard' };
        } else {
          // Usuário tem múltiplas contas, redirecionar para seleção
          return { redirectTo: '/selecionar-conta' };
        }
      } catch (error) {
        console.error('Erro ao verificar contas:', error);
        // Em caso de erro, redirecionar para dashboard
        return { redirectTo: '/dashboard' };
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterBackendRequest): Promise<{ redirectTo: string }> => {
    try {
      setLoading(true);
      console.log('useAuth - Dados recebidos para registro:', data);
      console.log('useAuth - Tipo dos dados:', typeof data);
      console.log('useAuth - Dados serializados:', JSON.stringify(data));
      await apiService.register(data);
      
      // Após registro bem-sucedido, fazer login automaticamente
      const loginResult = await login(data.cpf, data.senha);
      setLoading(false);
      return loginResult;
    } catch (error) {
        // Se o registro falhar, não tentar fazer login
        setLoading(false);
        throw error;
      }
    };

  const logout = (): void => {
    try {
      // Chamar endpoint de logout (opcional)
      apiService.logout().catch(() => {
        // Ignorar erros do logout no backend
      });
    } finally {
      // Limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;