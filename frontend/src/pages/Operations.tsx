import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils';
import { Conta } from '../types';
import TransferConfirmation from '../components/TransferConfirmation';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  color: #1F2937;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
`;

const OperationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const OperationCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
`;

const OperationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const OperationIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const OperationTitle = styled.h3`
  color: #1F2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #1F2937;
  font-weight: 500;
  font-size: 0.875rem;
`;

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#EF4444' : '#E5E7EB'};
  border-radius: 8px;
  background: #FFFFFF;
  color: #1F2937;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }

  &::placeholder {
    color: #6B7280;
  }
`;

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#EF4444' : '#E5E7EB'};
  border-radius: 8px;
  background: #FFFFFF;
  color: #1F2937;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3B82F6;
  }
`;

const ErrorMessage = styled.span`
  color: #EF4444;
  font-size: 0.875rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'secondary' ? 'transparent' : '#3B82F6'};
  color: ${props => props.variant === 'secondary' ? '#3B82F6' : 'white'};
  border: ${props => props.variant === 'secondary' ? '1px solid #3B82F6' : 'none'};

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const AccountInfo = styled.div`
  background: #F9FAFB;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  border: 1px solid #E5E7EB;
`;

const AccountItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E5E7EB;

  &:last-child {
    border-bottom: none;
  }
`;

const AccountLabel = styled.span`
  color: #6B7280;
  font-size: 0.875rem;
`;

const AccountValue = styled.span`
  color: #1F2937;
  font-weight: 600;
`;



interface DepositForm {
  conta_id: string;
  valor: number;
}

interface WithdrawForm {
  conta_id: string;
  valor: number;
}

interface TransferForm {
  conta_origem_id: string;
  conta_destino: string;
  valor: number;
}

const depositSchema = yup.object({
  conta_id: yup.string().required('Selecione uma conta'),
  valor: yup.number()
    .transform((value, originalValue) => {
      // Se o valor original for uma string vazia, retorna undefined
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      // Converte string para número
      const parsed = parseFloat(originalValue);
      return isNaN(parsed) ? undefined : parsed;
    })
    .positive('Valor deve ser positivo')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor mínimo é R$ 0,01')
    .max(50000, 'Valor máximo é R$ 50.000,00')
});

const withdrawSchema = yup.object({
  conta_id: yup.string().required('Selecione uma conta'),
  valor: yup.number()
    .transform((value, originalValue) => {
      // Se o valor original for uma string vazia, retorna undefined
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      // Converte string para número
      const parsed = parseFloat(originalValue);
      return isNaN(parsed) ? undefined : parsed;
    })
    .positive('Valor deve ser positivo')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor mínimo é R$ 0,01')
    .max(5000, 'Valor máximo é R$ 5.000,00')
});

const transferSchema = yup.object({
  conta_origem_id: yup.string().required('Selecione uma conta de origem'),
  conta_destino: yup.string().required('Número da conta de destino é obrigatório'),
  valor: yup.number()
    .transform((value, originalValue) => {
      // Se o valor original for uma string vazia, retorna undefined
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      // Converte string para número
      const parsed = parseFloat(originalValue);
      return isNaN(parsed) ? undefined : parsed;
    })
    .positive('Valor deve ser positivo')
    .required('Valor é obrigatório')
    .min(0.01, 'Valor mínimo é R$ 0,01')
    .max(10000, 'Valor máximo é R$ 10.000,00')
});

export const Operations: React.FC = () => {
  const { user } = useAuth();
  const { selectedAccount, accounts } = useSelectedAccount();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [showTransferConfirmation, setShowTransferConfirmation] = useState(false);
  const [transferValidationData, setTransferValidationData] = useState<any>(null);
  const [pendingTransferData, setPendingTransferData] = useState<TransferForm | null>(null);

  const depositForm = useForm<DepositForm>({
    resolver: yupResolver(depositSchema),
    defaultValues: {
      conta_id: selectedAccount?.numero || ''
    }
  });

  const withdrawForm = useForm<WithdrawForm>({
    resolver: yupResolver(withdrawSchema),
    defaultValues: {
      conta_id: selectedAccount?.numero || ''
    }
  });

  const transferForm = useForm<TransferForm>({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      conta_origem_id: selectedAccount?.numero || ''
    }
  });

  useEffect(() => {
    if (selectedAccount) {
      depositForm.setValue('conta_id', selectedAccount.numero);
      withdrawForm.setValue('conta_id', selectedAccount.numero);
      transferForm.setValue('conta_origem_id', selectedAccount.numero);
    }
  }, [selectedAccount, depositForm, withdrawForm, transferForm]);



  const handleDeposit = async (data: DepositForm) => {
    try {
      setLoading(true);
      await apiService.deposito(data.conta_id, {
        valor: data.valor
      });
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `Depósito de ${formatCurrency(data.valor)} realizado com sucesso!`
      });
      depositForm.reset();
    } catch (error: any) {
      let errorMessage = 'Erro ao realizar depósito';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message || 'Erro de validação')
            .join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (data: WithdrawForm) => {
    try {
      setLoading(true);
      await apiService.saque(data.conta_id, {
        valor: data.valor
      });
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `Saque de ${formatCurrency(data.valor)} realizado com sucesso!`
      });
      withdrawForm.reset();
    } catch (error: any) {
      let errorMessage = 'Erro ao realizar saque';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message || 'Erro de validação')
            .join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (data: TransferForm) => {
    try {
      setLoading(true);
      
      // Primeiro, validar a transferência
      const validationResponse = await fetch(`http://localhost:8000/transacoes/${data.conta_origem_id}/transferencia/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          conta_destino: data.conta_destino,
          valor: data.valor
        })
      });
      
      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        throw new Error(errorData.detail || 'Erro ao validar transferência');
      }
      
      const validationData = await validationResponse.json();
      
      // Armazenar dados para confirmação
      setTransferValidationData(validationData);
      setPendingTransferData(data);
      setShowTransferConfirmation(true);
      
    } catch (error: any) {
      let errorMessage = 'Erro ao validar transferência';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!pendingTransferData) return;
    
    try {
      setLoading(true);
      await apiService.transferencia(pendingTransferData.conta_origem_id, {
        conta_destino: pendingTransferData.conta_destino,
        valor: pendingTransferData.valor
      });
      
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `Transferência de ${formatCurrency(pendingTransferData.valor)} realizada com sucesso!`
      });
      
      transferForm.reset();
      setShowTransferConfirmation(false);
      setTransferValidationData(null);
      setPendingTransferData(null);
      
    } catch (error: any) {
      let errorMessage = 'Erro ao realizar transferência';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => err.msg || err.message || 'Erro de validação')
            .join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        }
      }
      
      addNotification({
        type: 'error',
        title: 'Erro',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = () => {
    setShowTransferConfirmation(false);
    setTransferValidationData(null);
    setPendingTransferData(null);
    setLoading(false);
  };

  const getSelectedAccount = (accountNumber: string) => {
    return accounts.find(account => account.numero === accountNumber);
  };

  return (
    <Container>
      <Title>Operações Bancárias</Title>
      
      {selectedAccount && (
        <AccountInfo>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Conta Selecionada</h3>
          <AccountItem>
            <div>
              <AccountLabel>Conta {selectedAccount.tipo_conta}</AccountLabel>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>Nº {selectedAccount.numero}</div>
            </div>
            <AccountValue>{formatCurrency(selectedAccount.saldo)}</AccountValue>
          </AccountItem>
        </AccountInfo>
      )}

      <OperationsGrid>
        {/* Depósito */}
        <OperationCard>
          <OperationHeader>
            <OperationIcon color="#10B981">
              <ArrowDownCircle size={24} />
            </OperationIcon>
            <OperationTitle>Depósito</OperationTitle>
          </OperationHeader>
          
          <Form onSubmit={depositForm.handleSubmit(handleDeposit)}>
            <input type="hidden" {...depositForm.register('conta_id')} />

            <FormGroup>
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...depositForm.register('valor')}
                hasError={!!depositForm.formState.errors.valor}
              />
              {depositForm.formState.errors.valor && (
                <ErrorMessage>{depositForm.formState.errors.valor.message}</ErrorMessage>
              )}
            </FormGroup>

            <div style={{ minHeight: '1.375rem', display: 'flex', alignItems: 'center' }}>
              {/* Espaço para informações adicionais */}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Depositar'}
            </Button>
          </Form>
        </OperationCard>

        {/* Saque */}
        <OperationCard>
          <OperationHeader>
            <OperationIcon color="#EF4444">
              <ArrowUpCircle size={24} />
            </OperationIcon>
            <OperationTitle>Saque</OperationTitle>
          </OperationHeader>
          
          <Form onSubmit={withdrawForm.handleSubmit(handleWithdraw)}>
            <input type="hidden" {...withdrawForm.register('conta_id')} />

            <FormGroup>
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...withdrawForm.register('valor')}
                hasError={!!withdrawForm.formState.errors.valor}
              />
              {withdrawForm.formState.errors.valor && (
                <ErrorMessage>{withdrawForm.formState.errors.valor.message}</ErrorMessage>
              )}
            </FormGroup>

            <div style={{ minHeight: '1.375rem', display: 'flex', alignItems: 'center' }}>
              {/* Espaço para informações adicionais */}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Sacar'}
            </Button>
          </Form>
        </OperationCard>

        {/* Transferência */}
        <OperationCard>
          <OperationHeader>
            <OperationIcon color="#3B82F6">
              <ArrowRightLeft size={24} />
            </OperationIcon>
            <OperationTitle>Transferência</OperationTitle>
          </OperationHeader>
          
          <Form onSubmit={transferForm.handleSubmit(handleTransfer)}>
            <input type="hidden" {...transferForm.register('conta_origem_id')} />

            <FormGroup>
              <Label>Conta de Destino</Label>
              <Input
                type="text"
                placeholder="Número da conta de destino"
                {...transferForm.register('conta_destino')}
                hasError={!!transferForm.formState.errors.conta_destino}
              />
              {transferForm.formState.errors.conta_destino && (
                <ErrorMessage>{transferForm.formState.errors.conta_destino.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...transferForm.register('valor')}
                hasError={!!transferForm.formState.errors.valor}
              />
              {transferForm.formState.errors.valor && (
                <ErrorMessage>{transferForm.formState.errors.valor.message}</ErrorMessage>
              )}
            </FormGroup>



            <Button type="submit" disabled={loading}>
              {loading ? 'Processando...' : 'Transferir'}
            </Button>
          </Form>
        </OperationCard>
      </OperationsGrid>
      
      {/* Modal de Confirmação de Transferência */}
      {showTransferConfirmation && transferValidationData && (
        <TransferConfirmation
          transferData={transferValidationData}
          onConfirm={handleConfirmTransfer}
          onCancel={handleCancelTransfer}
          isLoading={loading}
        />
      )}
    </Container>
  );
};