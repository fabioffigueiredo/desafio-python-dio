import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  RegisterBackendRequest,
  AuthResponse,
  User,
  Conta,
  ContaCreate,
  SaldoResponse,
  SaqueRequest,
  DepositoRequest,
  TransferenciaRequest,
  ExtratoRequest,
  ExtratoResponse,
  Transacao,
  ApiError,
  ChavePixCreate,
  ChavePix,
  ChavePixListResponse,
  PixTransferenciaRequest,
  PixValidationResponse,
  PixTransferenciaResponse,
  ChavePixDeleteRequest
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas e erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(data: LoginRequest): Promise<AuthResponse> {
    const loginData = {
      cpf: data.cpf,
      senha: data.senha
    };

    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', loginData);
    return response.data;
  }

  async register(data: RegisterBackendRequest): Promise<User> {
    console.log('apiService - Dados recebidos para registro:', data);
    console.log('apiService - Tipo dos dados:', typeof data);
    console.log('apiService - Dados serializados:', JSON.stringify(data));
    console.log('apiService - Enviando requisição para:', `${this.baseURL}/auth/register`);
    
    const response: AxiosResponse<User> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/auth/me');
    return response.data;
  }

  // Métodos de contas
  async getContas(): Promise<Conta[]> {
    const response: AxiosResponse<Conta[]> = await this.api.get('/contas/');
    return response.data;
  }

  async createConta(data: ContaCreate): Promise<Conta> {
    const response: AxiosResponse<Conta> = await this.api.post('/contas/', data);
    return response.data;
  }

  async getConta(numero: string): Promise<Conta> {
    const response: AxiosResponse<Conta> = await this.api.get(`/contas/${numero}`);
    return response.data;
  }

  async getSaldo(numero: string): Promise<SaldoResponse> {
    const response: AxiosResponse<SaldoResponse> = await this.api.get(`/contas/${numero}/saldo`);
    return response.data;
  }

  async deactivateConta(numero: string): Promise<void> {
    await this.api.delete(`/contas/${numero}`);
  }

  async toggleContaStatus(numero: string): Promise<void> {
    await this.api.patch(`/contas/${numero}/toggle-status`);
  }

  // Métodos de transações
  async saque(numero: string, data: SaqueRequest): Promise<Transacao> {
    const response: AxiosResponse<Transacao> = await this.api.post(`/transacoes/${numero}/saque`, data);
    return response.data;
  }

  async deposito(numero: string, data: DepositoRequest): Promise<Transacao> {
    const response: AxiosResponse<Transacao> = await this.api.post(`/transacoes/${numero}/deposito`, data);
    return response.data;
  }

  async transferencia(numero: string, data: TransferenciaRequest): Promise<Transacao[]> {
    const response: AxiosResponse<Transacao[]> = await this.api.post(`/transacoes/${numero}/transferencia`, data);
    return response.data;
  }

  async getExtrato(numero: string, params?: ExtratoRequest): Promise<ExtratoResponse> {
    const response: AxiosResponse<ExtratoResponse> = await this.api.get(`/transacoes/${numero}/extrato`, {
      params,
    });
    return response.data;
  }

  // Métodos PIX
  async criarChavePix(data: ChavePixCreate): Promise<ChavePix> {
    const response: AxiosResponse<ChavePix> = await this.api.post('/pix/chaves', data);
    return response.data;
  }

  async listarChavesPix(contaNumero: string): Promise<ChavePixListResponse> {
    const response: AxiosResponse<ChavePixListResponse> = await this.api.get(`/pix/chaves/${contaNumero}`);
    return response.data;
  }

  async removerChavePix(data: ChavePixDeleteRequest): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete('/pix/chaves', { data });
    return response.data;
  }

  async validarTransferenciaPix(contaNumero: string, data: PixTransferenciaRequest): Promise<PixValidationResponse> {
    const response: AxiosResponse<PixValidationResponse> = await this.api.post(`/pix/transferencia/${contaNumero}/validar`, data);
    return response.data;
  }

  async realizarTransferenciaPix(contaNumero: string, data: PixTransferenciaRequest): Promise<PixTransferenciaResponse> {
    const response: AxiosResponse<PixTransferenciaResponse> = await this.api.post(`/pix/transferencia/${contaNumero}`, data);
    return response.data;
  }

  // Métodos de configurações
  async updateProfile(data: any): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/auth/profile', data);
    return response.data;
  }

  async updatePassword(data: any): Promise<void> {
    await this.api.put('/auth/password', data);
  }

  async updateNotifications(data: any): Promise<void> {
    await this.api.put('/auth/notifications', data);
  }

  // Método para verificar saúde da API
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Método para tratar erros da API
  handleApiError(error: any): string {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Erro inesperado. Tente novamente.';
  }
}

export const apiService = new ApiService();
export default apiService;