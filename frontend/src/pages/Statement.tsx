import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Calendar, Filter, Download, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils';
import { Conta } from '../types';

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

const FiltersCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
`;

const FiltersTitle = styled.h3`
  color: #1F2937;
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

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

const StatementCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  overflow: hidden;
`;

const StatementHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const StatementTitle = styled.h3`
  color: #1F2937;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const TransactionsList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const TransactionItem = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #F9FAFB;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'deposito': return '#10B981';
      case 'saque': return '#EF4444';
      case 'transferencia': return '#3B82F6';
      default: return '#6B7280';
    }
  }};
  color: white;
`;

const TransactionDetails = styled.div`
  flex: 1;
`;

const TransactionType = styled.div`
  color: #1F2937;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const TransactionInfo = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const TransactionAmount = styled.div<{ type: string }>`
  color: ${props => {
    switch (props.type) {
      case 'deposito': return '#10B981';
      case 'saque': return '#EF4444';
      case 'transferencia': return '#3B82F6';
      default: return '#1F2937';
    }
  }};
  font-weight: 600;
  font-size: 1.125rem;
  text-align: right;
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #6B7280;
`;

const LoadingState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #6B7280;
`;

const ResultsInfo = styled.div`
  color: #6B7280;
  font-size: 0.875rem;
`;



interface Transaction {
  id: number;
  tipo: string;
  valor: number;
  data_transacao: string;
  conta_origem?: string;
  conta_destino?: string;
  descricao?: string;
}

interface FilterForm {
  conta_id?: string;
  tipo?: string;
  data_inicio?: string;
  data_fim?: string;
  valor_min?: string;
  valor_max?: string;
}

const filterSchema: yup.ObjectSchema<FilterForm> = yup.object().shape({
  conta_id: yup.string().optional(),
  tipo: yup.string().optional(),
  data_inicio: yup.string().optional(),
  data_fim: yup.string().optional(),
  valor_min: yup.string().optional(),
  valor_max: yup.string().optional()
});

export const Statement: React.FC = () => {
  const { user } = useAuth();
  const { selectedAccount, accounts } = useSelectedAccount();
  const { addNotification } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);

  const filterForm = useForm<FilterForm>({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      conta_id: selectedAccount?.numero || '',
      data_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 dias atrás (2 meses)
      data_fim: new Date().toISOString().split('T')[0] // hoje
    }
  });

  useEffect(() => {
    if (selectedAccount) {
      filterForm.setValue('conta_id', selectedAccount.numero);
      const filters = filterForm.getValues();
      loadTransactions(filters);
    }
  }, [selectedAccount]);

  // Observar mudanças na seleção de conta
  const watchedContaId = filterForm.watch('conta_id');
  
  useEffect(() => {
    if (watchedContaId && accounts.length > 0) {
      // Automaticamente carregar extrato dos últimos 2 meses quando uma conta for selecionada
      const filters = filterForm.getValues();
      loadTransactions(filters);
    }
  }, [watchedContaId, accounts]);



  const loadTransactions = async (filters?: FilterForm, showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      if (filters?.conta_id) {
          const response = await apiService.getExtrato(filters.conta_id);
          setTransactions(response.transacoes);
      } else {
        // Se não há conta específica, buscar de todas as contas
        const allTransactions: Transaction[] = [];
        for (const account of accounts) {
          try {
            const response = await apiService.getExtrato(account.numero);
            allTransactions.push(...response.transacoes);
          } catch (error) {
            // Ignorar erros de contas individuais
          }
        }
        setTransactions(allTransactions);
      }
      
      setHasFiltered(true);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Erro ao carregar extrato'
      });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleFilter = async (data: FilterForm) => {
    await loadTransactions(data);
  };

  const handleClearFilters = (e?: React.MouseEvent) => {
    e?.preventDefault();
    
    filterForm.reset({
      conta_id: selectedAccount?.numero || '', // Manter a conta selecionada
      tipo: '', // Limpar tipo de transação
      data_inicio: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 dias atrás (2 meses)
      data_fim: new Date().toISOString().split('T')[0],
      valor_min: '', // Limpar valor mínimo
      valor_max: '' // Limpar valor máximo
    });
    
    // Recarregar extrato se uma conta estiver selecionada (sem mostrar loading)
    if (selectedAccount) {
      const filters = filterForm.getValues();
      loadTransactions(filters, false); // false = não mostrar loading
    } else {
      setTransactions([]);
      setHasFiltered(false);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      addNotification({
        type: 'warning',
        title: 'Aviso',
        message: 'Não há transações para exportar'
      });
      return;
    }

    const csvContent = [
      ['Data', 'Tipo', 'Valor', 'Conta Origem', 'Conta Destino', 'Descrição'],
      ...transactions.map(transaction => [
        formatDate(transaction.data_transacao),
        transaction.tipo,
        transaction.valor.toString(),
        transaction.conta_origem || '',
        transaction.conta_destino || '',
        transaction.descricao || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `extrato_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification({
      type: 'success',
      title: 'Sucesso',
      message: 'Extrato exportado com sucesso!'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposito':
        return <ArrowDownCircle size={20} />;
      case 'saque':
        return <ArrowUpCircle size={20} />;
      case 'transferencia':
        return <ArrowRightLeft size={20} />;
      default:
        return <ArrowRightLeft size={20} />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposito':
        return 'Depósito';
      case 'saque':
        return 'Saque';
      case 'transferencia':
        return 'Transferência';
      default:
        return type;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const filters = filterForm.getValues();
    
    if (filters.tipo && transaction.tipo !== filters.tipo) {
      return false;
    }
    
    if (filters.data_inicio && new Date(transaction.data_transacao) < new Date(filters.data_inicio)) {
      return false;
    }
    
    if (filters.data_fim && new Date(transaction.data_transacao) > new Date(filters.data_fim + 'T23:59:59')) {
      return false;
    }
    
    if (filters.valor_min && filters.valor_min !== '' && !isNaN(Number(filters.valor_min)) && transaction.valor < Number(filters.valor_min)) {
      return false;
    }
    
    if (filters.valor_max && filters.valor_max !== '' && !isNaN(Number(filters.valor_max)) && transaction.valor > Number(filters.valor_max)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime());

  return (
    <Container>
      <Title>Extrato Bancário</Title>
      
      <FiltersCard>
        <FiltersTitle>
          <Filter size={20} />
          Filtros
        </FiltersTitle>
        
        <form onSubmit={filterForm.handleSubmit(handleFilter)}>
          <FiltersGrid>
            <input type="hidden" {...filterForm.register('conta_id')} />

            <FormGroup>
              <Label>Tipo de Transação</Label>
              <Select {...filterForm.register('tipo')}>
                <option value="">Todos os tipos</option>
                <option value="deposito">Depósito</option>
                <option value="saque">Saque</option>
                <option value="transferencia">Transferência</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Data Início</Label>
              <Input
                type="date"
                {...filterForm.register('data_inicio')}
              />
            </FormGroup>

            <FormGroup>
              <Label>Data Fim</Label>
              <Input
                type="date"
                {...filterForm.register('data_fim')}
              />
            </FormGroup>

            <FormGroup>
              <Label>Valor Mínimo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...filterForm.register('valor_min')}
              />
            </FormGroup>

            <FormGroup>
              <Label>Valor Máximo</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                {...filterForm.register('valor_max')}
              />
            </FormGroup>
          </FiltersGrid>
          
          <ButtonGroup>
            <Button type="submit" disabled={loading}>
              <Search size={16} />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
            <Button type="button" variant="secondary" onClick={handleExport} disabled={filteredTransactions.length === 0}>
              <Download size={16} />
              Exportar CSV
            </Button>
          </ButtonGroup>
        </form>
      </FiltersCard>

      <StatementCard>
        <StatementHeader>
          <StatementTitle>Transações</StatementTitle>
          <ResultsInfo>
            {filteredTransactions.length} transação(ões) encontrada(s)
          </ResultsInfo>
        </StatementHeader>
        
        <TransactionsList>
          {loading ? (
            <LoadingState>
              Carregando transações...
            </LoadingState>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState>
              {hasFiltered ? 'Nenhuma transação encontrada com os filtros aplicados.' : 'Selecione uma conta para ver o extrato dos últimos 2 meses.'}
            </EmptyState>
          ) : (
            filteredTransactions.map(transaction => (
              <TransactionItem key={transaction.id}>
                <TransactionIcon type={transaction.tipo}>
                  {getTransactionIcon(transaction.tipo)}
                </TransactionIcon>
                
                <TransactionDetails>
                  <TransactionType>
                    {getTransactionTypeLabel(transaction.tipo)}
                  </TransactionType>
                  <TransactionInfo>
                    <span>{formatDate(transaction.data_transacao)}</span>
                    {transaction.conta_origem && (
                      <span>De: {transaction.conta_origem}</span>
                    )}
                    {transaction.conta_destino && (
                      <span>Para: {transaction.conta_destino}</span>
                    )}
                    {transaction.descricao && (
                      <span>{transaction.descricao}</span>
                    )}
                  </TransactionInfo>
                </TransactionDetails>
                
                <TransactionAmount type={transaction.tipo}>
                  {transaction.tipo === 'saque' ? '-' : '+'}{formatCurrency(transaction.valor)}
                </TransactionAmount>
              </TransactionItem>
            ))
          )}
        </TransactionsList>
      </StatementCard>
    </Container>
  );
};