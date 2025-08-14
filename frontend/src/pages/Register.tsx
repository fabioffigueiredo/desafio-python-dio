import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { CreditCard, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { theme, Button, Input, Label, ErrorMessage, Card } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useNotification';
import { validateCPF, maskCPF, validatePassword } from '../utils';
import Loading from '../components/Loading';
import { RegisterRequest } from '../types';

// Estados brasileiros
const ESTADOS_BRASILEIROS = [
  { value: '', label: 'Selecione o estado' },
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.primary[800]} 100%);
  padding: ${theme.spacing.lg};
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.gray[600]};
  text-decoration: none;
  font-size: 0.875rem;
  
  &:hover {
    color: ${theme.colors.gray[900]};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.primary[600]};
`;

const LogoText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.gray[600]};
  margin-bottom: ${theme.spacing.xl};
  font-size: 1rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const InputGroup = styled.div`
  text-align: left;
`;

const InputRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select.withConfig({
  shouldForwardProp: (prop) => !['hasError'].includes(prop),
})<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? theme.colors.error[500] : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: 1rem;
  background-color: ${theme.colors.white};
  color: ${theme.colors.gray[900]};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.error[500] : theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.error[100] : theme.colors.primary[100]};
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[50]};
    cursor: not-allowed;
  }
`;

const AddressRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const AddressRowThree = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
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
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  
  &:hover {
    color: ${theme.colors.gray[600]};
  }
`;

const PasswordStrength = styled.div<{ strength: number }>`
  margin-top: ${theme.spacing.sm};
  height: 4px;
  background: ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.sm};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ strength }) => (strength / 4) * 100}%;
    background: ${({ strength }) => {
      if (strength <= 1) return theme.colors.error[500];
      if (strength <= 2) return theme.colors.warning[500];
      if (strength <= 3) return theme.colors.warning[400];
      return theme.colors.success[500];
    }};
    transition: all 0.3s ease;
  }
`;

const PasswordHints = styled.ul`
  margin-top: ${theme.spacing.sm};
  font-size: 0.75rem;
  color: ${theme.colors.gray[500]};
  text-align: left;
  
  li {
    margin-bottom: ${theme.spacing.xs};
  }
`;

const LoginLink = styled.div`
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

// Função para converter data dd/mm/yyyy para yyyy-mm-dd
const convertDateFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

// Função para validar formato dd/mm/yyyy
const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  return regex.test(dateStr);
};

const schema = yup.object({
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('cpf-valid', 'CPF inválido', (value) => {
      if (!value) return false;
      return validateCPF(value.replace(/\D/g, ''));
    }),
  nome: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  data_nascimento: yup
    .string()
    .required('Data de nascimento é obrigatória')
    .test('date-format', 'Use o formato dd/mm/yyyy', (value) => {
      if (!value) return false;
      return isValidDateFormat(value);
    })
    .test('age', 'Você deve ter pelo menos 18 anos', (value) => {
      if (!value || !isValidDateFormat(value)) return false;
      const convertedDate = convertDateFormat(value);
      const today = new Date();
      const birthDate = new Date(convertedDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),
  rua: yup
    .string()
    .required('Rua/Avenida é obrigatória')
    .min(5, 'Rua/Avenida deve ter pelo menos 5 caracteres'),
  numero: yup
    .string()
    .required('Número é obrigatório')
    .min(1, 'Número é obrigatório'),
  complemento: yup
    .string()
    .optional(),
  bairro: yup
    .string()
    .required('Bairro é obrigatório')
    .min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  estado: yup
    .string()
    .required('Estado é obrigatório')
    .test('estado-valid', 'Selecione um estado válido', (value) => {
      return value !== '' && ESTADOS_BRASILEIROS.some(estado => estado.value === value);
    }),
  senha: yup
    .string()
    .required('Senha é obrigatória')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .test('password-strength', 'Senha deve atender aos critérios de segurança', (value) => {
      if (!value) return false;
      const { isValid } = validatePassword(value);
      return isValid;
    }),
  confirmar_senha: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('senha')], 'Senhas não coincidem'),
});

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading: isLoading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange', // Validação em tempo real
  });

  const cpfValue = watch('cpf');
  const senhaValue = watch('senha');
  const dataValue = watch('data_nascimento');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskCPF(e.target.value);
    setValue('cpf', maskedValue);
  };

  // Função para máscara de data dd/mm/yyyy
  const maskDate = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskDate(e.target.value);
    setValue('data_nascimento', maskedValue);
  };

  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    const { errors: passwordErrors } = validatePassword(password);
    return Math.max(0, 4 - passwordErrors.length);
  };

  const onSubmit = async (data: RegisterRequest) => {
    try {
      
      // Combinar campos de endereço
      const enderecoCompleto = `${data.rua}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''}, ${data.bairro}, ${data.estado}`;
      
      // Converter data para formato yyyy-mm-dd
      const dataConvertida = convertDateFormat(data.data_nascimento);
      
      const registerData = {
        cpf: data.cpf.replace(/\D/g, ''),
        nome: data.nome,
        data_nascimento: dataConvertida,
        endereco: enderecoCompleto,
        senha: data.senha,
        confirmar_senha: data.confirmar_senha,
      };
      
      // Debug: log dos dados que serão enviados
      console.log('Dados do formulário:', data);
      console.log('Dados que serão enviados para o backend:', registerData);
      console.log('Dados serializados:', JSON.stringify(registerData));
      
      const result = await registerUser(registerData);
      success('Conta criada', 'Sua conta foi criada com sucesso!');
      navigate(result.redirectTo);
    } catch (err: any) {
      let errorMessage = 'Erro ao criar conta';
      
      if (err.response?.data?.detail) {
        // Se detail é um array de erros de validação
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map((error: any) => error.msg || error.message || 'Erro de validação')
            .join(', ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      }
      
      error('Erro no cadastro', errorMessage);
      // Os dados do formulário são mantidos automaticamente pelo react-hook-form
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <BackButton to="/login">
            <ArrowLeft size={16} />
            Voltar
          </BackButton>
          <Logo>
            <CreditCard size={32} />
            <LogoText>DIO Bank</LogoText>
          </Logo>
          <div style={{ width: '60px' }} /> {/* Spacer for centering */}
        </Header>
        
        <Subtitle>
          Crie sua conta bancária digital
        </Subtitle>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputRow>
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
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                hasError={!!errors.nome}
                {...register('nome')}
              />
              {errors.nome && <ErrorMessage>{errors.nome.message}</ErrorMessage>}
            </InputGroup>
          </InputRow>
          
          <InputGroup>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="text"
              placeholder="dd/mm/yyyy"
              hasError={!!errors.data_nascimento}
              value={dataValue || ''}
              onChange={handleDateChange}
              maxLength={10}
            />
            {errors.data_nascimento && <ErrorMessage>{errors.data_nascimento.message}</ErrorMessage>}
          </InputGroup>
          
          {/* Campos de Endereço Separados */}
          <AddressRow>
            <InputGroup>
              <Label htmlFor="rua">Rua/Avenida</Label>
              <Input
                id="rua"
                type="text"
                placeholder="Nome da rua ou avenida"
                hasError={!!errors.rua}
                {...register('rua')}
              />
              {errors.rua && <ErrorMessage>{errors.rua.message}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                type="text"
                placeholder="123"
                hasError={!!errors.numero}
                {...register('numero')}
              />
              {errors.numero && <ErrorMessage>{errors.numero.message}</ErrorMessage>}
            </InputGroup>
          </AddressRow>
          
          <AddressRowThree>
            <InputGroup>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                type="text"
                placeholder="Apto, casa, etc. (opcional)"
                hasError={!!errors.complemento}
                {...register('complemento')}
              />
              {errors.complemento && <ErrorMessage>{errors.complemento.message}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                type="text"
                placeholder="Nome do bairro"
                hasError={!!errors.bairro}
                {...register('bairro')}
              />
              {errors.bairro && <ErrorMessage>{errors.bairro.message}</ErrorMessage>}
            </InputGroup>
            
            <InputGroup>
              <Label htmlFor="estado">Estado</Label>
              <Select
                id="estado"
                hasError={!!errors.estado}
                {...register('estado')}
              >
                {ESTADOS_BRASILEIROS.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </Select>
              {errors.estado && <ErrorMessage>{errors.estado.message}</ErrorMessage>}
            </InputGroup>
          </AddressRowThree>
          
          <InputGroup>
            <Label htmlFor="senha">Senha</Label>
            <PasswordInputContainer>
              <Input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite uma senha segura"
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
            {senhaValue && (
              <PasswordStrength strength={getPasswordStrength(senhaValue)} />
            )}
            <PasswordHints>
              <li>Pelo menos 8 caracteres</li>
              <li>Uma letra maiúscula e uma minúscula</li>
              <li>Um número e um caractere especial</li>
            </PasswordHints>
            {errors.senha && <ErrorMessage>{errors.senha.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="confirmar_senha">Confirmar Senha</Label>
            <PasswordInputContainer>
              <Input
                id="confirmar_senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua senha"
                hasError={!!errors.confirmar_senha}
                {...register('confirmar_senha')}
              />
              <PasswordToggle
                type="button"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </PasswordInputContainer>
            {errors.confirmar_senha && <ErrorMessage>{errors.confirmar_senha.message}</ErrorMessage>}
          </InputGroup>
          
          <Button
            type="submit"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <Loading size="sm" color={theme.colors.white} />
            ) : (
              'Criar Conta'
            )}
          </Button>
        </Form>
        
        <LoginLink>
          Já tem uma conta?{' '}
          <Link to="/login">Fazer login</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;