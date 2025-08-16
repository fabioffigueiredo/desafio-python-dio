# Sistema Bancário DIO - v5.0

## 📋 Descrição

Sistema bancário completo desenvolvido para o desafio da DIO (Digital Innovation One), implementando operações bancárias modernas com arquitetura robusta usando FastAPI no backend e React no frontend.

## 🚀 Funcionalidades

### ✅ Implementadas (v5.0)
- **Autenticação de usuários** (registro, login, logout)
- **Gerenciamento de contas bancárias** (criação, visualização)
- **Operações bancárias**:
  - Depósito
  - Saque
  - Transferência entre contas
  - **Transferências PIX** (nova funcionalidade)
- **Sistema PIX completo**:
  - Criação e gerenciamento de chaves PIX
  - Transferências instantâneas via PIX
  - Histórico de transações PIX
- **Validações de negócio** (saldo suficiente, limites de valor)
- **Interface web responsiva** com React
- **Containerização** com Docker
- **Extrato detalhado** com todas as transações

### 🔄 Próximas versões
- Sistema de cartões
- Notificações em tempo real
- Relatórios financeiros
- Testes automatizados expandidos

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **MySQL** - Banco de dados relacional
- **Pydantic** - Validação de dados
- **JWT** - Autenticação baseada em tokens

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Styled Components** - CSS-in-JS
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🏗️ Arquitetura

```
├── app/                    # Backend FastAPI
│   ├── auth/              # Autenticação e autorização
│   ├── core/              # Configurações centrais
│   ├── database/          # Configuração do banco
│   ├── models/            # Modelos SQLAlchemy
│   ├── routes/            # Endpoints da API
│   └── schemas/           # Schemas Pydantic
├── frontend/              # Frontend React
│   ├── public/            # Arquivos públicos
│   └── src/               # Código fonte React
│       ├── components/    # Componentes reutilizáveis
│       ├── contexts/      # Contextos React
│       ├── pages/         # Páginas da aplicação
│       └── services/      # Serviços de API
└── tests/                 # Testes automatizados
```

## 🚀 Como executar

### Pré-requisitos
- Docker
- Docker Compose

### Execução

1. Clone o repositório:
```bash
git clone https://github.com/fabioffigueiredo/sistema-bancario-dio.git
cd sistema-bancario-dio
```

2. Execute com Docker Compose:
```bash
docker-compose up --build
```

3. Acesse a aplicação:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 📊 Banco de Dados

O sistema utiliza MySQL com as seguintes tabelas principais:
- `usuarios` - Dados dos usuários
- `contas` - Contas bancárias
- `transacoes` - Histórico de transações
- `chaves_pix` - Chaves PIX dos usuários
- `transacoes_pix` - Transações PIX específicas

## 🔐 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:
- Tokens têm validade de 30 minutos
- Refresh automático no frontend
- Middleware de autenticação protege rotas sensíveis

## 💰 Regras de Negócio

### Depósitos
- Valor mínimo: R$ 0,01
- Valor máximo: R$ 50.000,00
- Não há limite de depósitos por dia

### Saques
- Valor mínimo: R$ 0,01
- Valor máximo: R$ 5.000,00
- Verificação de saldo suficiente

### Transferências
- Valor mínimo: R$ 0,01
- Valor máximo: R$ 10.000,00
- Verificação de saldo suficiente
- Confirmação obrigatória

### PIX
- Valor mínimo: R$ 0,01
- Valor máximo: R$ 50.000,00
- Transferências instantâneas
- Suporte a chaves: CPF, e-mail, telefone, chave aleatória
- Verificação de saldo suficiente

## 🧪 Testes

Para executar os testes:
```bash
pytest
```

## 📝 API Documentation

A documentação completa da API está disponível em:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Fabio Figueiredo**
- GitHub: [@fabioffigueiredo](https://github.com/fabioffigueiredo)

## 🎯 Desafio DIO

Este projeto foi desenvolvido como parte do desafio da Digital Innovation One (DIO), demonstrando:
- Arquitetura de software moderna
- Boas práticas de desenvolvimento
- Containerização com Docker
- API RESTful com FastAPI
- Interface moderna com React
- Validações robustas de negócio

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

