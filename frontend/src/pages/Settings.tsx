import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { theme, Button, Card } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import { apiService } from '../services/api';
import Loading from '../components/Loading';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${theme.spacing.xl};
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.sm} 0;
  font-size: 2rem;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: ${theme.colors.gray[600]};
  margin: 0;
  font-size: 1rem;
`;

const SettingsSection = styled(Card)`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.gray[900]};
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
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
  
  &:disabled {
    background-color: ${theme.colors.gray[100]};
    cursor: not-allowed;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.gray[500]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  
  &:hover {
    color: ${theme.colors.gray[700]};
  }
`;

const ErrorMessage = styled.span`
  color: ${theme.colors.error[600]};
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.success[600]};
  font-size: 0.875rem;
  margin-top: ${theme.spacing.sm};
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
`;

const ToggleLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  
  h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${theme.colors.gray[900]};
  }
  
  p {
    margin: 0;
    font-size: 0.75rem;
    color: ${theme.colors.gray[600]};
  }
`;

const Toggle = styled.button<{ $active: boolean }>`
  width: 48px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  background: ${({ $active }) => $active ? theme.colors.primary[500] : theme.colors.gray[300]};
  
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${({ $active }) => $active ? '26px' : '2px'};
    transition: all 0.2s ease;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

// Schemas de validação
const profileSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido'),
  telefone: yup.string(),
});

const passwordSchema = yup.object({
  senha_atual: yup.string().required('Senha atual é obrigatória'),
  nova_senha: yup.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .required('Nova senha é obrigatória'),
  confirmar_senha: yup.string()
    .oneOf([yup.ref('nova_senha')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória'),
});

type ProfileFormData = {
  nome: string;
  email?: string;
  telefone?: string;
};

type PasswordFormData = {
  senha_atual: string;
  nova_senha: string;
  confirmar_senha: string;
};

type NotificationSettings = {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  transaction_alerts: boolean;
};

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    transaction_alerts: true,
  });
  
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();

  const profileForm = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nome: user?.nome || '',
      email: '',
      telefone: '',
    },
    mode: 'onChange',
  });

  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
    mode: 'onChange',
  });

  const togglePassword = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const toggleNotification = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      await apiService.updateProfile(data);
      updateUser({ ...user!, ...data });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: 'Perfil atualizado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.detail || 'Erro ao atualizar perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setLoading(true);
      await apiService.updatePassword({
        senha_atual: data.senha_atual,
        nova_senha: data.nova_senha,
      });
      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: 'Senha alterada com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.detail || 'Erro ao alterar senha',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      await apiService.updateNotifications(notifications);
      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: 'Configurações de notificação salvas!',
      });
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error.response?.data?.detail || 'Erro ao salvar configurações',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Loading fullScreen message="Carregando configurações..." />;
  }

  return (
    <Container>
      <Header>
        <Title>Configurações</Title>
        <Subtitle>Gerencie suas informações pessoais e preferências</Subtitle>
      </Header>

      {/* Perfil */}
      <SettingsSection>
        <SectionHeader>
          <User size={20} />
          <SectionTitle>Informações Pessoais</SectionTitle>
        </SectionHeader>
        
        <Form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <FormRow>
            <FormGroup>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                {...profileForm.register('nome')}
                className={profileForm.formState.errors.nome ? 'error' : ''}
              />
              {profileForm.formState.errors.nome && (
                <ErrorMessage>{profileForm.formState.errors.nome.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={user.cpf}
                disabled
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...profileForm.register('email')}
                className={profileForm.formState.errors.email ? 'error' : ''}
              />
              {profileForm.formState.errors.email && (
                <ErrorMessage>{profileForm.formState.errors.email.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...profileForm.register('telefone')}
              />
            </FormGroup>
          </FormRow>

          {profileSuccess && (
            <SuccessMessage>
              <CheckCircle size={16} />
              Perfil atualizado com sucesso!
            </SuccessMessage>
          )}

          <ButtonGroup>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </ButtonGroup>
        </Form>
      </SettingsSection>

      {/* Segurança */}
      <SettingsSection>
        <SectionHeader>
          <Lock size={20} />
          <SectionTitle>Segurança</SectionTitle>
        </SectionHeader>
        
        <Form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <FormGroup>
            <Label htmlFor="senha_atual">Senha Atual</Label>
            <PasswordInputContainer>
              <Input
                id="senha_atual"
                type={showPasswords.current ? 'text' : 'password'}
                {...passwordForm.register('senha_atual')}
                className={passwordForm.formState.errors.senha_atual ? 'error' : ''}
              />
              <PasswordToggle
                type="button"
                onClick={() => togglePassword('current')}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </PasswordInputContainer>
            {passwordForm.formState.errors.senha_atual && (
              <ErrorMessage>{passwordForm.formState.errors.senha_atual.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="nova_senha">Nova Senha</Label>
              <PasswordInputContainer>
                <Input
                  id="nova_senha"
                  type={showPasswords.new ? 'text' : 'password'}
                  {...passwordForm.register('nova_senha')}
                  className={passwordForm.formState.errors.nova_senha ? 'error' : ''}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => togglePassword('new')}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInputContainer>
              {passwordForm.formState.errors.nova_senha && (
                <ErrorMessage>{passwordForm.formState.errors.nova_senha.message}</ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="confirmar_senha">Confirmar Nova Senha</Label>
              <PasswordInputContainer>
                <Input
                  id="confirmar_senha"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  {...passwordForm.register('confirmar_senha')}
                  className={passwordForm.formState.errors.confirmar_senha ? 'error' : ''}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => togglePassword('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInputContainer>
              {passwordForm.formState.errors.confirmar_senha && (
                <ErrorMessage>{passwordForm.formState.errors.confirmar_senha.message}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>

          {passwordSuccess && (
            <SuccessMessage>
              <CheckCircle size={16} />
              Senha alterada com sucesso!
            </SuccessMessage>
          )}

          <ButtonGroup>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              <Shield size={16} />
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </ButtonGroup>
        </Form>
      </SettingsSection>

      {/* Notificações */}
      <SettingsSection>
        <SectionHeader>
          <Bell size={20} />
          <SectionTitle>Notificações</SectionTitle>
        </SectionHeader>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <ToggleContainer>
            <ToggleLabel>
              <h4>Notificações por Email</h4>
              <p>Receba atualizações importantes por email</p>
            </ToggleLabel>
            <Toggle
              $active={notifications.email_notifications}
              onClick={() => toggleNotification('email_notifications')}
            />
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <h4>Notificações por SMS</h4>
              <p>Receba alertas de segurança por SMS</p>
            </ToggleLabel>
            <Toggle
              $active={notifications.sms_notifications}
              onClick={() => toggleNotification('sms_notifications')}
            />
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <h4>Notificações Push</h4>
              <p>Receba notificações no navegador</p>
            </ToggleLabel>
            <Toggle
              $active={notifications.push_notifications}
              onClick={() => toggleNotification('push_notifications')}
            />
          </ToggleContainer>

          <ToggleContainer>
            <ToggleLabel>
              <h4>Alertas de Transação</h4>
              <p>Seja notificado sobre todas as transações</p>
            </ToggleLabel>
            <Toggle
              $active={notifications.transaction_alerts}
              onClick={() => toggleNotification('transaction_alerts')}
            />
          </ToggleContainer>
        </div>

        <ButtonGroup>
          <Button
            variant="primary"
            onClick={saveNotificationSettings}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Salvando...' : 'Salvar Preferências'}
          </Button>
        </ButtonGroup>
      </SettingsSection>
    </Container>
  );
};

export default Settings;