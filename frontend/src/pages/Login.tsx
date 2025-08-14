import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { theme, Button, Input, Label, ErrorMessage, Card } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useNotification';
import { validateCPF, maskCPF } from '../utils';
import Loading from '../components/Loading';
import { LoginRequest } from '../types';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%);
  padding: ${theme.spacing.lg};
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  color: ${theme.colors.primary[600]};
`;

const LogoText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xl};
  font-size: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const InputGroup = styled.div`
  text-align: left;
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
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  
  &:hover {
    color: ${theme.colors.gray[600]};
  }
`;

const ForgotPassword = styled(Link)`
  color: ${theme.colors.primary[600]};
  font-size: 0.875rem;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterLink = styled.div`
  margin-top: ${theme.spacing.xl};
  padding-top: ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.gray[600]};
  font-size: 0.875rem;
  
  a {
    color: ${theme.colors.primary[600]};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const schema = yup.object({
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('cpf-valid', 'CPF inválido', (value) => {
      if (!value) return false;
      return validateCPF(value);
    }),
  senha: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
  });

  const cpfValue = watch('cpf');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCPF(e.target.value);
    setValue('cpf', maskedValue);
  };

  const onSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      const result = await login(data.cpf.replace(/\D/g, ''), data.senha);
      success('Login realizado', 'Bem-vindo ao DIO Bank!');
      navigate(result.redirectTo);
    } catch (err: any) {
      let errorMessage = 'Credenciais inválidas';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map((error: any) => error.msg || error.message || 'Erro de validação')
            .join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      
      error('Erro no login', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <CreditCard size={40} />
          <LogoText>DIO Bank</LogoText>
        </Logo>
        
        <Subtitle>
          Acesse sua conta bancária digital
        </Subtitle>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              type="text"
              placeholder="000.000.000-00"
              hasError={!!errors.cpf}
              value={cpfValue || ''}
              onChange={handleCPFChange}
              maxLength={14}
            />
            {errors.cpf && <ErrorMessage>{errors.cpf.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="senha">Senha</Label>
            <PasswordInputContainer>
              <Input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                hasError={!!errors.senha}
                {...register('senha')}
              />
              <PasswordToggle
                type="button"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordInputContainer>
            {errors.senha && <ErrorMessage>{errors.senha.message}</ErrorMessage>}
          </InputGroup>
          
          <div style={{ textAlign: 'right' }}>
            <ForgotPassword to="/esqueci-senha">
              Esqueci minha senha
            </ForgotPassword>
          </div>
          
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <Loading size="sm" color={theme.colors.white} />
            ) : (
              'Entrar'
            )}
          </Button>
        </Form>
        
        <RegisterLink>
          Não tem uma conta?{' '}
          <Link to="/registro">Criar conta</Link>
        </RegisterLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;