import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CreditCard, ArrowRight } from 'lucide-react';
import { theme, Button, Card } from '../styles/GlobalStyles';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatAccountNumber } from '../utils';
import Loading from '../components/Loading';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.primary[100]} 100%);
  padding: ${theme.spacing.lg};
`;

const SelectionCard = styled(Card)`
  width: 100%;
  max-width: 600px;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.gray[600]};
  margin: 0 0 ${theme.spacing.xl} 0;
  font-size: 1.1rem;
`;

const AccountList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const AccountCard = styled.button`
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%);
  border: none;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  color: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-align: left;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
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
  position: relative;
  z-index: 1;
`;

const AccountInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const AccountIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccountDetails = styled.div`
  text-align: left;
`;

const AccountType = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: ${theme.spacing.xs};
`;

const AccountNumber = styled.div`
  font-size: 1rem;
  font-weight: 600;
`;

const AccountBalance = styled.div`
  text-align: right;
  position: relative;
  z-index: 1;
`;

const BalanceLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: ${theme.spacing.xs};
`;

const BalanceValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
`;

const SelectIcon = styled.div`
  position: absolute;
  top: 50%;
  right: ${theme.spacing.lg};
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
  
  ${AccountCard}:hover & {
    opacity: 1;
  }
`;

const BackButton = styled(Button)`
  margin-top: ${theme.spacing.lg};
`;

const AccountSelector: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { accounts, setSelectedAccount, loading } = useSelectedAccount();

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getAccountTypeLabel = (tipo: string) => {
    return tipo === 'corrente' ? 'Conta Corrente' : 'Conta Poupança';
  };

  if (loading) {
    return <Loading fullScreen message="Carregando suas contas..." />;
  }

  return (
    <Container>
      <SelectionCard>
        <Title>Selecione uma Conta</Title>
        <Subtitle>
          Olá, {user?.nome?.split(' ')[0]}! Você possui múltiplas contas.
          <br />
          Escolha qual conta deseja acessar:
        </Subtitle>
        
        <AccountList>
          {accounts.map((account) => (
            <AccountCard
              key={account.numero}
              onClick={() => handleAccountSelect(account)}
            >
              <AccountHeader>
                <AccountInfo>
                  <AccountIcon>
                    <CreditCard size={24} />
                  </AccountIcon>
                  <AccountDetails>
                    <AccountType>
                      {getAccountTypeLabel(account.tipo_conta)}
                    </AccountType>
                    <AccountNumber>
                      {formatAccountNumber(account.numero)}
                    </AccountNumber>
                  </AccountDetails>
                </AccountInfo>
                
                <AccountBalance>
                  <BalanceLabel>Saldo Disponível</BalanceLabel>
                  <BalanceValue>
                    {formatCurrency(account.saldo)}
                  </BalanceValue>
                </AccountBalance>
              </AccountHeader>
              
              <SelectIcon>
                <ArrowRight size={24} />
              </SelectIcon>
            </AccountCard>
          ))}
        </AccountList>
        
        <BackButton variant="secondary" onClick={handleLogout}>
          Sair da Conta
        </BackButton>
      </SelectionCard>
    </Container>
  );
};

export default AccountSelector;