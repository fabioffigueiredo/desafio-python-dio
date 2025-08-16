// Tipos para autenticação
export interface LoginRequest {
  cpf: string;
  senha: string;
}

export interface RegisterRequest {
  cpf: string;
  nome: string;
  data_nascimento: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  estado: string;
  senha: string;
  confirmar_senha: string;
}

// Tipo para envio ao backend (mantém estrutura original)
export interface RegisterBackendRequest {
  cpf: string;
  nome: string;
  data_nascimento: string;
  endereco: string;
  senha: string;
  confirmar_senha: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  cpf: string;
  nome: string;
  data_nascimento: string;
  endereco: string;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

// Tipos para contas
export interface Conta {
  numero: string;
  agencia: string;
  tipo_conta: 'corrente' | 'poupanca';
  id: number;
  saldo: number;
  ativa: boolean;
  cliente_id: number;
  created_at: string;
  updated_at: string;
  limite?: number; // Apenas para corrente
}

export interface ContaCreate {
  tipo_conta: 'corrente' | 'poupanca';
  limite?: number;
}

export interface SaldoResponse {
  numero: string;
  saldo: number;
  saldo_disponivel?: number;
  limite?: number;
}

// Tipos para transações
export interface Transacao {
  id: number;
  tipo: 'saque' | 'deposito' | 'transferencia_debito' | 'transferencia_credito';
  valor: number;
  data_transacao: string;
  conta_numero: string;
  conta_destino_numero?: string;
}

export interface SaqueRequest {
  valor: number;
}

export interface DepositoRequest {
  valor: number;
}

export interface TransferenciaRequest {
  conta_destino: string;
  valor: number;
}

export interface ExtratoRequest {
  data_inicio?: string;
  data_fim?: string;
  tipo_transacao?: 'saque' | 'deposito' | 'transferencia_debito' | 'transferencia_credito';
}

export interface ExtratoResponse {
  conta_numero: string;
  periodo: {
    data_inicio: string;
    data_fim: string;
  };
  transacoes: Transacao[];
  resumo: {
    total_saques: number;
    total_depositos: number;
    saldo_inicial: number;
    saldo_final: number;
  };
}

// Tipos para API
export interface ApiError {
  detail: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Tipos para formulários
export interface FormErrors {
  [key: string]: string;
}

// Tipos para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (cpf: string, senha: string) => Promise<{ redirectTo: string }>;
  register: (data: RegisterBackendRequest) => Promise<{ redirectTo: string }>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Tipos para dashboard
export interface DashboardData {
  contas: Conta[];
  transacoes_recentes: Transacao[];
  resumo_financeiro: {
    saldo_total: number;
    total_contas: number;
    transacoes_mes: number;
  };
}

// Tipos para PIX
export type TipoChavePix = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';

export interface ChavePix {
  id: number;
  chave: string;
  tipo: TipoChavePix;
  ativa: boolean;
  data_criacao: string;
  conta_numero: string;
}

export interface ChavePixCreate {
  chave: string;
  tipo: TipoChavePix;
  conta_numero: string;
}

export interface ChavePixListResponse {
  chaves: ChavePix[];
  total: number;
}

export interface PixTransferenciaRequest {
  chave_destino: string;
  valor: number;
  descricao?: string;
}

export interface PixValidationResponse {
  chave_destino: string;
  beneficiario_nome: string;
  beneficiario_cpf: string;
  valor: number;
  taxa: number;
  valor_total: number;
  saldo_disponivel: number;
}

export interface PixTransferenciaResponse {
  id: number;
  chave_origem: string;
  chave_destino: string;
  valor: number;
  descricao?: string;
  status: string;
  data_transacao: string;
}

export interface ChavePixDeleteRequest {
  chave: string;
}