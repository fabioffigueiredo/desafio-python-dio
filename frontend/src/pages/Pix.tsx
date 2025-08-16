import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { useSelectedAccount } from '../hooks/useSelectedAccount';
import { apiService } from '../services/api';
import { ChavePix } from '../types';

interface TransferenciaPix {
  chave_destino: string;
  valor: number;
  descricao?: string;
}

interface ValidationData {
  beneficiario_nome: string;
  beneficiario_cpf: string;
  chave_destino: string;
  valor: number;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 2rem;
`;

const AccountInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const AccountNumber = styled.p`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const Balance = styled.p`
  font-size: 1.5rem;
  font-weight: bold;
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 2rem;
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>`
  padding: 1rem 0;
  font-weight: 500;
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #3b82f6;
  }
`;

const PixGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const PixCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 1px solid ${props => props.hasError ? '#ef4444' : '#d1d5db'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: #3b82f6;
          color: white;
          &:hover {
            background: #2563eb;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const ChavesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChaveItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const ChaveInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ChaveType = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
`;

const ChaveValue = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  margin: 1rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const ConfirmationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #1f2937;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const createChaveSchema = yup.object({
  tipo: yup.string().required('Tipo é obrigatório'),
  chave: yup.string().when('tipo', {
    is: (tipo: string) => tipo !== 'aleatoria',
    then: (schema) => schema.required('Chave é obrigatória'),
    otherwise: (schema) => schema.notRequired()
  })
});

const transferSchema = yup.object({
  chave_destino: yup.string().required('Chave PIX é obrigatória'),
  valor: yup.number().positive('Valor deve ser positivo').required('Valor é obrigatório'),
  descricao: yup.string().optional()
});

const Pix: React.FC = () => {
  const { user } = useAuth();
  const { selectedAccount, loadAccounts } = useSelectedAccount();
  const [activeTab, setActiveTab] = useState<'chaves' | 'transferir'>('chaves');
  const [chaves, setChaves] = useState<ChavePix[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationData, setValidationData] = useState<ValidationData | null>(null);
  const [detectedKeyType, setDetectedKeyType] = useState<string>('');

  const {
    register: registerChave,
    handleSubmit: handleSubmitChave,
    formState: { errors: errorsChave },
    reset: resetChave,
    watch: watchChave
  } = useForm({
    resolver: yupResolver(createChaveSchema)
  });

  const {
    register: registerTransfer,
    handleSubmit: handleSubmitTransfer,
    formState: { errors: errorsTransfer },
    reset: resetTransfer,
    getValues: getTransferValues
  } = useForm({
    resolver: yupResolver(transferSchema)
  });

  const tipoChave = watchChave('tipo');

  useEffect(() => {
    if (selectedAccount) {
      loadChaves();
    }
  }, [selectedAccount]);

  const loadChaves = async () => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      const response = await apiService.listarChavesPix(selectedAccount.numero);
      setChaves(response.chaves || []);
    } catch (error: any) {
      console.error(error.response?.data?.detail || 'Erro ao carregar chaves PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChave = async (data: any) => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      await apiService.criarChavePix({
        conta_numero: selectedAccount.numero,
        tipo: data.tipo,
        chave: data.tipo === 'aleatoria' ? undefined : data.chave
      });
      
      console.log('Chave PIX criada com sucesso!');
      setShowCreateModal(false);
      resetChave();
      loadChaves();
    } catch (error: any) {
      console.error(error.response?.data?.detail || 'Erro ao criar chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChave = async (chaveId: number) => {
    if (!selectedAccount || !window.confirm('Tem certeza que deseja excluir esta chave PIX?')) return;
    
    const chaveToDelete = chaves.find(chave => chave.id === chaveId);
    if (!chaveToDelete) return;
    
    try {
      setLoading(true);
      await apiService.removerChavePix({
        chave: chaveToDelete.chave
      });
      console.log('Chave PIX excluída com sucesso!');
      loadChaves();
    } catch (error: any) {
      console.error(error.response?.data?.detail || 'Erro ao excluir chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const detectChaveType = (chave: string): string => {
    const trimmedChave = chave.trim();
    
    // Email: contém @ e formato válido
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedChave)) {
      return 'email';
    }
    
    // CPF: 11 dígitos numéricos (com ou sem formatação)
    const onlyNumbers = trimmedChave.replace(/\D/g, '');
    if (onlyNumbers.length === 11 && /^\d{11}$/.test(onlyNumbers)) {
      return 'cpf';
    }
    
    // Telefone: 10 ou 11 dígitos (com ou sem formatação)
    if ((onlyNumbers.length === 10 && /^\d{10}$/.test(onlyNumbers)) || 
        (onlyNumbers.length === 11 && /^\d{11}$/.test(onlyNumbers) && onlyNumbers.charAt(2) === '9')) {
      return 'telefone';
    }
    
    // Chave aleatória: UUID ou string alfanumérica
    return 'aleatoria';
  };

  const cleanChavePix = (chave: string, tipo?: string) => {
    // Para CPF e telefone, remove todos os caracteres não numéricos
    if (tipo === 'cpf' || tipo === 'telefone') {
      return chave.replace(/\D/g, '');
    }
    // Para email, mantém como está
    if (tipo === 'email') {
      return chave.toLowerCase();
    }
    // Para outros tipos, remove formatação geral
    return chave.replace(/[^\w@.-]/g, '');
  };

  const handleChaveDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.trim()) {
      const keyType = detectChaveType(value);
      setDetectedKeyType(keyType);
    } else {
      setDetectedKeyType('');
    }
  };

  const handleValidateTransfer = async (data: TransferenciaPix) => {
    if (!selectedAccount) return;
    
    try {
      setLoading(true);
      const tipoDetectado = detectChaveType(data.chave_destino);
      const chaveDestino = cleanChavePix(data.chave_destino, tipoDetectado);
      const response = await apiService.validarTransferenciaPix(selectedAccount.numero, {
        chave_destino: chaveDestino,
        valor: data.valor,
        descricao: data.descricao || ''
      });
      
      setValidationData({
        ...response,
        valor: data.valor
      });
      setShowTransferModal(false);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error(error.response?.data?.detail || 'Erro ao validar transferência');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedAccount || !validationData) return;
    
    const transferData = getTransferValues();
    
    try {
      setLoading(true);
      await apiService.realizarTransferenciaPix(selectedAccount.numero, {
        chave_destino: validationData.chave_destino,
        valor: validationData.valor,
        descricao: transferData.descricao
      });
      
      console.log('Transferência PIX realizada com sucesso!');
      setShowConfirmation(false);
      setValidationData(null);
      resetTransfer();
      
      // Recarregar dados da conta para atualizar o saldo
      await loadAccounts();
    } catch (error: any) {
      console.error(error.response?.data?.detail || 'Erro ao realizar transferência');
    } finally {
      setLoading(false);
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'E-mail',
      telefone: 'Telefone',
      aleatoria: 'Chave Aleatória'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const formatChaveDisplay = (chave: ChavePix) => {
    if (chave.tipo === 'cpf') {
      return chave.chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (chave.tipo === 'telefone') {
      return chave.chave.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return chave.chave;
  };

  if (!selectedAccount) {
    return (
      <Container>
        <Title>PIX</Title>
        <EmptyState>
          <p>Selecione uma conta para acessar as funcionalidades PIX</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>PIX</Title>
      
      <AccountInfo>
        <AccountNumber>Conta: {selectedAccount.numero} • Saldo: R$ {Number(selectedAccount.saldo).toFixed(2)}</AccountNumber>
      </AccountInfo>

      <TabContainer>
        <TabList>
          <Tab 
            active={activeTab === 'chaves'} 
            onClick={() => setActiveTab('chaves')}
          >
            Minhas Chaves
          </Tab>
          <Tab 
            active={activeTab === 'transferir'} 
            onClick={() => setActiveTab('transferir')}
          >
            Transferir
          </Tab>
        </TabList>
      </TabContainer>

      {activeTab === 'chaves' && (
        <PixGrid>
          <PixCard>
            <CardTitle>Gerenciar Chaves PIX</CardTitle>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              style={{ marginBottom: '1.5rem' }}
            >
              Nova Chave PIX
            </Button>

            {chaves.length > 0 ? (
              <ChavesList>
                {chaves.map((chave) => (
                  <ChaveItem key={chave.id}>
                    <ChaveInfo>
                      <ChaveType>{getTipoLabel(chave.tipo)}</ChaveType>
                      <ChaveValue>{formatChaveDisplay(chave)}</ChaveValue>
                    </ChaveInfo>
                    <Button 
                      variant="danger" 
                      onClick={() => handleDeleteChave(chave.id)}
                      disabled={loading}
                    >
                      Excluir
                    </Button>
                  </ChaveItem>
                ))}
              </ChavesList>
            ) : (
              <EmptyState>
                <p>Nenhuma chave PIX cadastrada</p>
              </EmptyState>
            )}
          </PixCard>
        </PixGrid>
      )}

      {activeTab === 'transferir' && (
        <PixGrid>
          <PixCard>
            <CardTitle>Transferir via PIX</CardTitle>
            
            <Button onClick={() => setShowTransferModal(true)}>
              Nova Transferência
            </Button>
            
            <EmptyState>
              <p>Clique em "Nova Transferência" para iniciar</p>
            </EmptyState>
          </PixCard>
        </PixGrid>
      )}

      {/* Modal Criar Chave */}
      {showCreateModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Nova Chave PIX</ModalTitle>
            
            <Form onSubmit={handleSubmitChave(handleCreateChave)}>
              <div>
                <label htmlFor="pix-tipo">Tipo de Chave</label>
                <Select 
                  id="pix-tipo"
                  {...registerChave('tipo')} 
                  hasError={!!errorsChave.tipo}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </Select>
                {errorsChave.tipo && (
                  <ErrorMessage>{errorsChave.tipo.message}</ErrorMessage>
                )}
              </div>

              {tipoChave && tipoChave !== 'aleatoria' && (
                <div>
                  <label htmlFor="pix-chave">Chave PIX</label>
                  <Input
                    id="pix-chave"
                    {...registerChave('chave')}
                    type={tipoChave === 'email' ? 'email' : 'text'}
                    placeholder={`Digite seu ${getTipoLabel(tipoChave).toLowerCase()}`}
                    hasError={!!errorsChave.chave}
                  />
                  {errorsChave.chave && (
                    <ErrorMessage>{errorsChave.chave.message}</ErrorMessage>
                  )}
                </div>
              )}

              <ModalActions>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowCreateModal(false);
                    resetChave();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Chave'}
                </Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Transferir */}
      {showTransferModal && (
        <Modal>
          <ModalContent>
            <ModalTitle>Transferir via PIX</ModalTitle>
            
            <Form onSubmit={handleSubmitTransfer(handleValidateTransfer)}>
              <div>
                <label htmlFor="transfer-chave-destino">Chave PIX do Destinatário</label>
                <Input
                  id="transfer-chave-destino"
                  {...registerTransfer('chave_destino')}
                  placeholder="Digite a chave PIX do destinatário"
                  hasError={!!errorsTransfer.chave_destino}
                  onChange={(e) => {
                    registerTransfer('chave_destino').onChange(e);
                    handleChaveDestinoChange(e);
                  }}
                />
                {detectedKeyType && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Tipo detectado: {detectedKeyType === 'cpf' ? 'CPF' : 
                                   detectedKeyType === 'telefone' ? 'Telefone' :
                                   detectedKeyType === 'email' ? 'E-mail' : 'Chave Aleatória'}
                  </div>
                )}
                {errorsTransfer.chave_destino && (
                  <ErrorMessage>{errorsTransfer.chave_destino.message}</ErrorMessage>
                )}
              </div>

              <div>
                <label htmlFor="transfer-valor">Valor</label>
                <Input
                  id="transfer-valor"
                  {...registerTransfer('valor')}
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Valor"
                  hasError={!!errorsTransfer.valor}
                />
                {errorsTransfer.valor && (
                  <ErrorMessage>{errorsTransfer.valor.message}</ErrorMessage>
                )}
              </div>

              <div>
                <label htmlFor="transfer-descricao">Descrição (opcional)</label>
                <Input
                  id="transfer-descricao"
                  {...registerTransfer('descricao')}
                  placeholder="Descrição (opcional)"
                />
              </div>

              <ModalActions>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setShowTransferModal(false);
                    setDetectedKeyType('');
                    resetTransfer();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Validando...' : 'Continuar'}
                </Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal Confirmação */}
      {showConfirmation && validationData && (
        <Modal>
          <ModalContent>
            <ModalTitle>Confirmar Transferência PIX</ModalTitle>
            
            <ConfirmationDetails>
              <DetailItem>
                <DetailLabel>Destinatário</DetailLabel>
                <DetailValue>{validationData.beneficiario_nome}</DetailValue>
                <DetailValue style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {validationData.beneficiario_cpf}
                </DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel>Chave PIX</DetailLabel>
                <DetailValue>{validationData.chave_destino}</DetailValue>
              </DetailItem>
              
              <DetailItem>
                <DetailLabel>Valor</DetailLabel>
                <DetailValue style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  R$ {validationData.valor.toFixed(2)}
                </DetailValue>
              </DetailItem>
              
              {getTransferValues().descricao && (
                <DetailItem>
                  <DetailLabel>Descrição</DetailLabel>
                  <DetailValue>{getTransferValues().descricao}</DetailValue>
                </DetailItem>
              )}
            </ConfirmationDetails>

            <ModalActions>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowConfirmation(false);
                  setShowTransferModal(true);
                }}
              >
                Voltar
              </Button>
              <Button onClick={handleConfirmTransfer} disabled={loading}>
                {loading ? 'Transferindo...' : 'Confirmar Transferência'}
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Pix;