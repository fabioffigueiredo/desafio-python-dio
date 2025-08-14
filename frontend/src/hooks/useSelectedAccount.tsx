import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conta } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

interface SelectedAccountContextType {
  selectedAccount: Conta | null;
  accounts: Conta[];
  setSelectedAccount: (account: Conta | null) => void;
  loadAccounts: () => Promise<void>;
  loading: boolean;
  hasMultipleAccounts: boolean;
}

const SelectedAccountContext = createContext<SelectedAccountContextType | undefined>(undefined);

interface SelectedAccountProviderProps {
  children: ReactNode;
}

export const SelectedAccountProvider: React.FC<SelectedAccountProviderProps> = ({ children }) => {
  const [selectedAccount, setSelectedAccount] = useState<Conta | null>(null);
  const [accounts, setAccounts] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadAccounts = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setLoading(true);
      const accountsData = await apiService.getContas();
      const activeAccounts = accountsData.filter(conta => conta.ativa);
      setAccounts(activeAccounts);
      
      // Se há apenas uma conta ativa, seleciona automaticamente
      if (activeAccounts.length === 1) {
        setSelectedAccount(activeAccounts[0]);
        localStorage.setItem('selectedAccount', JSON.stringify(activeAccounts[0]));
      } else {
        // Verifica se há uma conta selecionada salva no localStorage
        const savedAccount = localStorage.getItem('selectedAccount');
        if (savedAccount) {
          const parsedAccount = JSON.parse(savedAccount);
          // Verifica se a conta salva ainda existe e está ativa
          const accountExists = activeAccounts.find(acc => acc.numero === parsedAccount.numero);
          if (accountExists) {
            setSelectedAccount(accountExists);
          } else {
            localStorage.removeItem('selectedAccount');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSelectedAccount = (account: Conta | null) => {
    setSelectedAccount(account);
    if (account) {
      localStorage.setItem('selectedAccount', JSON.stringify(account));
    } else {
      localStorage.removeItem('selectedAccount');
    }
  };

  useEffect(() => {
    if (user) {
      loadAccounts();
    } else {
      // Limpar dados quando o usuário faz logout
      setAccounts([]);
      setSelectedAccount(null);
      localStorage.removeItem('selectedAccount');
    }
  }, [user]);

  const hasMultipleAccounts = accounts.length > 1;

  const value: SelectedAccountContextType = {
    selectedAccount,
    accounts,
    setSelectedAccount: handleSetSelectedAccount,
    loadAccounts,
    loading,
    hasMultipleAccounts,
  };

  return (
    <SelectedAccountContext.Provider value={value}>
      {children}
    </SelectedAccountContext.Provider>
  );
};

export const useSelectedAccount = (): SelectedAccountContextType => {
  const context = useContext(SelectedAccountContext);
  if (context === undefined) {
    throw new Error('useSelectedAccount must be used within a SelectedAccountProvider');
  }
  return context;
};

export default useSelectedAccount;