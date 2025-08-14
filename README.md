# Sistema Bancário DIO - Full Stack

Sistema bancário completo desenvolvido como parte do desafio da DIO, implementando uma API RESTful com FastAPI e uma interface web moderna com React. Inclui autenticação JWT, banco de dados SQLite, confirmação de transferências e containerização com Docker.

## 🚀 Funcionalidades

### 🔐 Autenticação
- ✅ Registro de novos clientes com CPF e senha
- ✅ Login com JWT tokens
- ✅ Validação de CPF
- ✅ Criptografia de senhas com bcrypt
- ✅ Interface de login e registro no frontend

### 🏦 Gestão de Contas
- ✅ Criação de contas corrente e poupança
- ✅ Consulta de saldo e detalhes da conta
- ✅ Listagem de contas do cliente
- ✅ Desativação de contas
- ✅ Dashboard com visão geral das contas

### 💰 Operações Bancárias
- ✅ Depósitos com validação de valores
- ✅ Saques com limite diário e validação de saldo
- ✅ **Transferências com confirmação visual**
- ✅ **Validação prévia de transferências**
- ✅ **Modal de confirmação com dados do beneficiário**
- ✅ Extrato detalhado com nomes dos beneficiários
- ✅ Histórico completo de transações
- ✅ Interface web moderna e responsiva

### 🎨 Interface Frontend
- ✅ **Aplicação React com TypeScript**
- ✅ **Design moderno e responsivo**
- ✅ **Componente de confirmação de transferência**
- ✅ **Notificações em tempo real**
- ✅ **Formatação automática de valores e CPF**
- ✅ **Estados de loading e feedback visual**

## 🛠️ Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **SQLite** - Banco de dados leve e eficiente
- **Pydantic** - Validação de dados
- **JWT** - Autenticação baseada em tokens
- **Pytest** - Framework de testes
- **Pre-commit** - Hooks de qualidade de código

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - JavaScript tipado
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones modernos
- **CSS-in-JS** - Estilização inline

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📁 Estrutura do Projeto

```
desafio-python-dio/
├── app/                    # Backend FastAPI
│   ├── auth/              # Autenticação e segurança
│   ├── core/              # Configurações centrais
│   ├── database/          # Configuração do banco
│   ├── models/            # Modelos SQLAlchemy
│   ├── routes/            # Rotas da API
│   ├── schemas/           # Schemas Pydantic
│   └── main.py            # Aplicação principal
├── frontend/              # Frontend React
│   ├── public/            # Arquivos públicos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   └── TransferConfirmation.tsx  # Modal de confirmação
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── services/      # Serviços de API
│   │   ├── types/         # Tipos TypeScript
│   │   └── utils/         # Utilitários
│   ├── package.json       # Dependências Node.js
│   └── tsconfig.json      # Configuração TypeScript
├── tests/                 # Testes automatizados
├── docker-compose.yml     # Orquestração de containers
├── Dockerfile             # Imagem da aplicação
├── requirements.txt       # Dependências Python
└── README.md             # Documentação
```

## 🚀 Como Executar o Sistema

### 🐳 Opção 1: Executando com Docker (Recomendado)

#### Pré-requisitos
- Docker
- Docker Compose

#### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd desafio-python-dio
```

2. **Execute com Docker Compose**
```bash
docker-compose up --build
```

3. **Acesse a aplicação**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 💻 Opção 2: Executando Localmente

#### Pré-requisitos
- Python 3.11+
- Node.js 18+
- npm ou yarn

#### Backend (FastAPI)

1. **Instale as dependências Python**
```bash
pip install -r requirements.txt
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Execute o backend**
```bash
uvicorn app.main:app --reload
```

#### Frontend (React)

1. **Navegue para o diretório frontend**
```bash
cd frontend
```

2. **Instale as dependências Node.js**
```bash
npm install
```

3. **Execute o frontend**
```bash
npm start
```

4. **Acesse a aplicação**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 🧪 Executando Testes

```bash
# Executar todos os testes
pytest

# Executar com cobertura
pytest --cov=app

# Executar testes específicos
pytest tests/test_auth.py
```

## 🔧 Qualidade de Código

### Pre-commit Hooks

```bash
# Instalar pre-commit
pre-commit install

# Executar manualmente
pre-commit run --all-files
```

### Formatação de Código

```bash
# Black (formatação)
black app/ tests/

# isort (organização de imports)
isort app/ tests/

# flake8 (linting)
flake8 app/ tests/
```

## 📖 Como Usar o Sistema

### 🎯 Fluxo Básico de Uso

1. **Acesse a aplicação** em http://localhost:3000
2. **Registre-se** como novo cliente ou faça **login**
3. **Crie uma conta** (corrente ou poupança)
4. **Realize operações bancárias**:
   - Depósitos
   - Saques
   - Transferências com confirmação
5. **Consulte seu extrato** e histórico

### 💸 Sistema de Confirmação de Transferência

O sistema implementa um fluxo seguro de transferências:

1. **Preenchimento**: Digite os dados da transferência
2. **Validação**: Sistema valida conta destino e saldo
3. **Confirmação**: Modal exibe dados do beneficiário
4. **Execução**: Transferência é processada após confirmação

### 🔐 Segurança

- Todas as operações requerem autenticação
- Validação de saldo em tempo real
- Confirmação visual antes de transferências
- Criptografia de senhas
- Tokens JWT com expiração

## 📚 Documentação da API

### Endpoints Principais

#### Autenticação
- `POST /auth/register` - Registrar novo cliente
- `POST /auth/login` - Fazer login
- `POST /auth/logout` - Fazer logout

#### Contas
- `POST /contas/` - Criar nova conta
- `GET /contas/` - Listar contas do cliente
- `GET /contas/{numero}` - Obter detalhes da conta
- `GET /contas/{numero}/saldo` - Consultar saldo
- `DELETE /contas/{numero}` - Desativar conta

#### Transações
- `POST /transacoes/{numero}/deposito` - Realizar depósito
- `POST /transacoes/{numero}/saque` - Realizar saque
- `POST /transacoes/{numero}/transferencia/validar` - **Validar transferência**
- `POST /transacoes/{numero}/transferencia` - Realizar transferência
- `GET /transacoes/{numero}/extrato` - Obter extrato

### Exemplo de Uso

1. **Registrar cliente**
```json
POST /auth/register
{
  "cpf": "12345678901",
  "nome": "João Silva",
  "data_nascimento": "1990-01-01",
  "endereco": "Rua Teste, 123",
  "password": "senha123",
  "password_confirm": "senha123"
}
```

2. **Fazer login**
```json
POST /auth/login
{
  "cpf": "12345678901",
  "password": "senha123"
}
```

3. **Criar conta**
```json
POST /contas/
Authorization: Bearer <token>
{
  "tipo_conta": "corrente",
  "limite": 1000.0
}
```

4. **Realizar depósito**
```json
POST /transacoes/{numero}/deposito
Authorization: Bearer <token>
{
  "valor": 500.0,
  "origem": "caixa",
  "descricao": "Depósito inicial"
}
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT com expiração
- Validação rigorosa de dados de entrada
- Proteção contra SQL injection
- CORS configurado adequadamente

## 📊 Banco de Dados

### Modelos

- **Cliente**: Dados pessoais e autenticação
- **Conta**: Informações da conta bancária
- **ContaCorrente**: Extensão com limite e controle de saques
- **Transacao**: Registro base de transações
- **Saque**: Transação de saque com taxa
- **Deposito**: Transação de depósito com origem

### Relacionamentos

- Cliente 1:N Conta
- Conta 1:N Transacao

## 🚀 Deploy

### Variáveis de Ambiente de Produção

```env
DATABASE_URL=mysql+pymysql://user:pass@host:port/db
SECRET_KEY=sua-chave-super-secreta-de-producao
DEBUG=false
```

### Considerações de Produção

- Use HTTPS em produção
- Configure CORS adequadamente
- Use um banco de dados dedicado
- Implemente logging adequado
- Configure monitoramento

## 🚀 Próximos Passos e Melhorias

### 📋 Funcionalidades Planejadas

- [ ] **Dashboard Analytics**: Gráficos de gastos e receitas
- [ ] **Notificações**: Sistema de alertas em tempo real
- [ ] **Histórico Avançado**: Filtros por período e tipo
- [ ] **Exportação**: PDF e Excel do extrato
- [ ] **Limites**: Configuração de limites de transferência
- [ ] **Agendamento**: Transferências programadas
- [ ] **PIX**: Integração com sistema PIX
- [ ] **Cartões**: Gestão de cartões de débito/crédito

### 🔧 Melhorias Técnicas

- [ ] **Testes E2E**: Cypress para testes completos
- [ ] **PWA**: Transformar em Progressive Web App
- [ ] **Docker Compose**: Ambiente completo com banco
- [ ] **CI/CD**: Pipeline de deploy automatizado
- [ ] **Monitoramento**: Logs e métricas de performance
- [ ] **Cache**: Redis para otimização
- [ ] **Backup**: Sistema de backup automático

### 🎨 Melhorias de UX/UI

- [ ] **Tema Escuro**: Modo dark/light
- [ ] **Responsividade**: Otimização mobile
- [ ] **Acessibilidade**: Conformidade WCAG
- [ ] **Animações**: Micro-interações
- [ ] **Offline**: Funcionalidade offline básica

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como parte do desafio da DIO (Digital Innovation One).

