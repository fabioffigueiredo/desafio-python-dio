import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  CreditCard, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Edit3,
  AlertCircle
} from 'lucide-react';
import { theme, Button, Card } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import { formatCurrency, formatAccountNumber } from '../utils';
import { Conta } from '../types';
import Loading from '../components/Loading';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
  }
`;

const Title = styled.h1`
  color: ${theme.colors.gray[900]};
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const AccountsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const AccountCard = styled.div<{ $active: boolean }>`
  background: ${({ $active }) => 
    $active 
      ? `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%)`
      : `linear-gradient(135deg, ${theme.colors.gray[400]} 0%, ${theme.colors.gray[600]} 100%)`
  };
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.xl};
  color: ${theme.colors.white};
  margin-bottom: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
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

const AccountType = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: ${theme.spacing.xs};
`;

const AccountNumber = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;



const AccountActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: ${theme.colors.white};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const BalanceSection = styled.div`
  position: relative;
  z-index: 1;
`;

const BalanceLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: ${theme.spacing.xs};
`;

const BalanceValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: ${theme.spacing.md};
`;

const AccountStatus = styled.div<{ $active: boolean }>`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const CreateAccountSection = styled(Card)`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.lg} 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-weight: 500;
  color: ${theme.colors.gray[700]};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &.error {
    border-color: ${theme.colors.error[500]};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  background: ${theme.colors.white};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &.error {
    border-color: ${theme.colors.error[500]};
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error[600]};
  font-size: 0.875rem;
  margin-top: ${theme.spacing.xs};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.gray[600]};
  
  svg {
    margin-bottom: ${theme.spacing.lg};
    color: ${theme.colors.gray[400]};
  }
  
  h3 {
    margin: 0 0 ${theme.spacing.sm} 0;
    color: ${theme.colors.gray[700]};
  }
  
  p {
    margin: 0;
  }
`;

// Schema de validação
const createAccountSchema = yup.object({
  tipo_conta: yup.string().oneOf(['corrente', 'poupanca']).required('Tipo de conta é obrigatório'),
  limite: yup.number().when('tipo_conta', {
    is: 'corrente',
    then: (schema) => schema.min(0, 'Limite deve ser maior ou igual a zero').required('Limite é obrigatório para conta corrente'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

type CreateAccountFormData = {
  tipo_conta: 'corrente' | 'poupanca';
  limite?: number;
};

export const Accounts: React.FC = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalances, setShowBalances] = useState<{ [key: string]: boolean }>({});
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CreateAccountFormData>({
    defaultValues: {
      tipo_conta: 'corrente',
    },
  });

  const loadContas = async () => {
    try {
      setLoading(true);
      const contas = await apiService.getContas();
      setContas(contas);
    } catch (error: any) {
      console.error('Erro ao carregar contas:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.detail || 'Erro ao carregar contas',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await apiService.createConta(data);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: 'Conta criada com sucesso!',
      });
      reset();
      loadContas();
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
        } else {
          errorMessage = 'Erro de validação nos dados fornecidos';
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage,
      });
    }
  };

  const toggleBalance = (contaNumero: string) => {
    setShowBalances(prev => ({
      ...prev,
      [contaNumero]: !prev[contaNumero]
    }));
  };

  const toggleAccountStatus = async (conta: Conta) => {
    try {
      await apiService.toggleContaStatus(conta.numero);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `Conta ${conta.ativa ? 'desativada' : 'ativada'} com sucesso!`,
      });
      loadContas();
    } catch (error: any) {
      console.error('Erro ao alterar status da conta:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.detail || 'Erro ao alterar status da conta',
      });
    }
  };

  useEffect(() => {
    loadContas();
  }, []);

  if (loading) {
    return <Loading fullScreen message="Carregando contas..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Minhas Contas</Title>
      </Header>

      <CreateAccountSection>
        <SectionTitle>
          <Plus size={20} />
          Criar Nova Conta
        </SectionTitle>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="tipo_conta">Tipo de Conta</Label>
            <Select
              id="tipo_conta"
              {...register('tipo_conta')}
              className={errors.tipo_conta ? 'error' : ''}
            >
              <option value="">Selecione o tipo</option>
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
            </Select>
            {errors.tipo_conta && (
              <ErrorMessage>{errors.tipo_conta.message}</ErrorMessage>
            )}
          </FormGroup>

          {watch('tipo_conta') === 'corrente' && (
            <FormGroup>
              <Label htmlFor="limite">Limite (R$)</Label>
              <Input
                id="limite"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('limite', { valueAsNumber: true })}
                className={errors.limite ? 'error' : ''}
              />
              {errors.limite && (
                <ErrorMessage>{errors.limite.message}</ErrorMessage>
              )}
            </FormGroup>
          )}

          <FormGroup>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Conta'}
            </Button>
          </FormGroup>
        </Form>
      </CreateAccountSection>

      {contas.length === 0 ? (
        <EmptyState>
          <CreditCard size={64} />
          <h3>Nenhuma conta encontrada</h3>
          <p>Crie sua primeira conta para começar a usar o DIO Bank</p>
        </EmptyState>
      ) : (
        <AccountsGrid>
          {contas.map((conta) => (
            <AccountCard 
              key={conta.numero} 
              $active={conta.ativa}
            >
              <AccountHeader>
                <div>
                  <AccountType>
                    {conta.tipo_conta === 'corrente' && 'Conta Corrente'}
                    {conta.tipo_conta === 'poupanca' && 'Conta Poupança'}
                  </AccountType>
                  <AccountNumber>
                    {conta.numero ? formatAccountNumber(conta.numero) : 'N/A'}
                  </AccountNumber>
                </div>
                
                <AccountActions>
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBalance(conta.numero);
                    }}
                    title={showBalances[conta.numero] ? 'Ocultar saldo' : 'Mostrar saldo'}
                  >
                    {showBalances[conta.numero] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </ActionButton>
                  
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAccountStatus(conta);
                    }}
                    title={conta.ativa ? 'Desativar conta' : 'Ativar conta'}
                  >
                    {conta.ativa ? '✓' : '✗'}
                  </ActionButton>
                </AccountActions>
              </AccountHeader>
              
              <BalanceSection>
                <BalanceLabel>Saldo Disponível</BalanceLabel>
                <BalanceValue>
                  {showBalances[conta.numero] ? formatCurrency(conta.saldo) : '••••••'}
                </BalanceValue>
                
                <AccountStatus $active={conta.ativa}>
                  {conta.ativa ? 'Conta Ativa' : 'Conta Inativa'}
                </AccountStatus>
              </BalanceSection>
            </AccountCard>
          ))}
        </AccountsGrid>
      )}
    </Container>
  );
};

export default Accounts;