import React from 'react';
import { AlertTriangle, User, CreditCard, DollarSign } from 'lucide-react';

interface TransferConfirmationProps {
  transferData: {
    conta_destino: string;
    beneficiario_nome: string;
    beneficiario_cpf: string;
    valor: number;
    saldo_disponivel: number;
    taxa: number;
    valor_total: number;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
  transferData,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '28rem',
        margin: '0 1rem'
      }}>
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '0.5rem'
          }}>
            <AlertTriangle style={{ height: '2rem', width: '2rem', color: '#eab308' }} />
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 0.5rem 0'
          }}>
            Confirmar Transferência
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0
          }}>
            Verifique os dados antes de confirmar
          </p>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Beneficiário */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <User style={{ height: '1.25rem', width: '1.25rem', color: '#2563eb', marginRight: '0.5rem' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Beneficiário</span>
            </div>
            <div style={{ marginLeft: '1.75rem' }}>
              <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>{transferData.beneficiario_nome}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>CPF: {formatCPF(transferData.beneficiario_cpf)}</p>
            </div>
          </div>

          {/* Conta Destino */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <CreditCard style={{ height: '1.25rem', width: '1.25rem', color: '#16a34a', marginRight: '0.5rem' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Conta Destino</span>
            </div>
            <div style={{ marginLeft: '1.75rem' }}>
              <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>{transferData.conta_destino}</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Agência: 0001</p>
            </div>
          </div>

          {/* Valores */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <DollarSign style={{ height: '1.25rem', width: '1.25rem', color: '#9333ea', marginRight: '0.5rem' }} />
              <span style={{ fontWeight: '600', color: '#374151' }}>Valores</span>
            </div>
            <div style={{ marginLeft: '1.75rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: '#6b7280' }}>Valor da transferência:</span>
                <span style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(transferData.valor)}</span>
              </div>
              {transferData.taxa > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#6b7280' }}>Taxa:</span>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{formatCurrency(transferData.taxa)}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1px solid #d1d5db',
                paddingTop: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Total:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#111827' }}>{formatCurrency(transferData.valor_total)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem'
              }}>
                <span style={{ color: '#6b7280' }}>Saldo disponível:</span>
                <span style={{ color: '#6b7280' }}>{formatCurrency(transferData.saldo_disponivel)}</span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            paddingTop: '1rem'
          }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Processando...' : 'Confirmar Transferência'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferConfirmation;