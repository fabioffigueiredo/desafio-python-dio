import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { theme, Button, Card } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useToast } from '../hooks/useNotification';
import { apiService } from '../services/api';
import { Conta, Transacao } from '../types';
import { formatCurrency, formatDateTime, formatAccountNumber } from '../utils';
import Loading from '../components/Loading';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const WelcomeSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
  }
`;

const WelcomeText = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${theme.colors.gray[900]};
    margin: 0 0 ${theme.spacing.sm} 0;
  }
  
  p {
    color: ${theme.colors.gray[600]};
    margin: 0;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
`;

const StatIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: ${theme.borderRadius.xl};
  background: ${({ color }) => color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const StatValue = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const AccountsSection = styled(Card)`
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
    margin: 0 0 ${theme.spacing.lg} 0;
  }
`;

const AccountCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%);
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  color: ${theme.colors.white};
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
`;

const AccountHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.lg};
`;

const AccountType = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const AccountNumber = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const BalanceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Balance = styled.div`
  h3 {
    font-size: 0.875rem;
    opacity: 0.9;
    margin: 0 0 ${theme.spacing.xs} 0;
  }
  
  p {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
  }
`;

const BalanceToggle = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: ${theme.colors.white};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TransactionsSection = styled(Card)`
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${theme.colors.gray[900]};
    margin: 0 0 ${theme.spacing.lg} 0;
  }
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid ${theme.colors.gray[100]};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ type }) => {
    switch (type) {
      case 'deposito':
      case 'transferencia_credito':
        return theme.colors.success[100];
      case 'saque':
      case 'transferencia_debito':
        return theme.colors.error[100];
      default:
        return theme.colors.gray[100];
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'deposito':
      case 'transferencia_credito':
        return theme.colors.success[600];
      case 'saque':
      case 'transferencia_debito':
        return theme.colors.error[600];
      default:
        return theme.colors.gray[600];
    }
  }};
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionType = styled.div`
  font-weight: 500;
  color: ${theme.colors.gray[900]};
  font-size: 0.875rem;
`;

const TransactionDate = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.gray[500]};
`;

const TransactionAmount = styled.div<{ type: string }>`
  font-weight: 600;
  color: ${({ type }) => {
    switch (type) {
      case 'deposito':
      case 'transferencia_credito':
        return theme.colors.success[600];
      case 'saque':
      case 'transferencia_debito':
        return theme.colors.error[600];
      default:
        return theme.colors.gray[900];
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.gray[500]};
`;

const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'deposito':
    case 'transferencia_credito':
      return <ArrowDownLeft size={20} />;
    case 'saque':
    case 'transferencia_debito':
      return <ArrowUpRight size={20} />;
    default:
      return <CreditCard size={20} />;
  }
};

const getTransactionLabel = (type: string) => {
  switch (type) {
    case 'deposito':
      return 'Depósito';
    case 'saque':
      return 'Saque';
    case 'transferencia_credito':
      return 'Transferência Recebida';
    case 'transferencia_debito':
      return 'Transferência Enviada';
    default:
      return 'Transação';
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [monthlyTransactions, setMonthlyTransactions] = useState(0);
  const { user } = useAuth();
  const { selectedAccount, accounts } = useSelectedAccount();
  const { error: showError } = useToast();

  const loadDashboardData = useCallback(async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      
      // Carregar transações da conta selecionada
      const extrato = await apiService.getExtrato(selectedAccount.numero);
      const todasTransacoes = extrato.transacoes;
      
      // Ordenar por data (mais recentes primeiro)
      const transacoesOrdenadas = todasTransacoes.sort(
        (a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime()
      );
      
      setRecentTransactions(transacoesOrdenadas.slice(0, 5));
      
      // Calcular transações do mês atual
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const transacoesMes = todasTransacoes.filter(
        transacao => new Date(transacao.data_transacao) >= inicioMes
      );
      setMonthlyTransactions(transacoesMes.length);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      showError('Erro', 'Não foi possível carregar os dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, showError]);

  useEffect(() => {
    if (selectedAccount) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [loadDashboardData, selectedAccount]);



  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const activeAccounts = accounts.filter(conta => conta.ativa).length;
  const totalBalance = accounts.reduce((total, conta) => total + conta.saldo, 0);

  if (loading) {
    return <Loading fullScreen message="Carregando dashboard..." />;
  }

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeText>
          <h1>Olá, {user?.nome?.split(' ')[0]}! 👋</h1>
          <p>Bem-vindo de volta ao seu DIO Bank</p>
        </WelcomeText>
        
        <QuickActions>
          <Button variant="primary" onClick={() => navigate('/contas')}>
            <Plus size={20} />
            Nova Conta
          </Button>
          <Button variant="secondary">
            <ArrowUpRight size={20} />
            Transferir
          </Button>
        </QuickActions>
      </WelcomeSection>

      <StatsGrid>
        <StatCard>
          <StatIcon color={theme.colors.primary[500]}>
            <CreditCard size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Saldo Total</StatLabel>
            <StatValue>
              {showBalance ? formatCurrency(selectedAccount?.saldo || 0) : '••••••'}
            </StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color={theme.colors.success[500]}>
            <TrendingUp size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Contas Ativas</StatLabel>
            <StatValue>{activeAccounts}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color={theme.colors.warning[500]}>
            <TrendingDown size={24} />
          </StatIcon>
          <StatContent>
            <StatLabel>Transações este Mês</StatLabel>
            <StatValue>{monthlyTransactions}</StatValue>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <ContentGrid>
        <AccountsSection>
          <h2>Conta Selecionada</h2>
          {selectedAccount ? (
            <AccountCard>
              <AccountHeader>
                <AccountType>{selectedAccount.tipo_conta}</AccountType>
                <AccountNumber>•••• {selectedAccount.numero.slice(-4)}</AccountNumber>
              </AccountHeader>
              
              <BalanceSection>
                <Balance>
                  <h3>Saldo Disponível</h3>
                  <p>
                    {showBalance ? formatCurrency(selectedAccount.saldo) : '••••••'}
                  </p>
                </Balance>
                
                <BalanceToggle onClick={toggleBalanceVisibility}>
                  {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                </BalanceToggle>
              </BalanceSection>
            </AccountCard>
          ) : (
            <EmptyState>
              <p>Nenhuma conta selecionada.</p>
            </EmptyState>
          )}
        </AccountsSection>

        <TransactionsSection>
          <h2>Transações Recentes</h2>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transacao) => (
              <TransactionItem key={transacao.id}>
                <TransactionIcon type={transacao.tipo}>
                  {getTransactionIcon(transacao.tipo)}
                </TransactionIcon>
                
                <TransactionDetails>
                  <TransactionType>
                    {getTransactionLabel(transacao.tipo)}
                  </TransactionType>
                  <TransactionDate>
                    {formatDateTime(transacao.data_transacao)}
                  </TransactionDate>
                </TransactionDetails>
                
                <TransactionAmount type={transacao.tipo}>
                  {transacao.tipo === 'deposito' || transacao.tipo === 'transferencia_credito' ? '+' : '-'}
                  {formatCurrency(transacao.valor)}
                </TransactionAmount>
              </TransactionItem>
            ))
          ) : (
            <EmptyState>
              <p>Nenhuma transação encontrada.</p>
            </EmptyState>
          )}
        </TransactionsSection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default Dashboard;