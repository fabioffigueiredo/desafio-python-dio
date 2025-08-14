# Sistema Bancário DIO - Makefile
# Comandos para facilitar o desenvolvimento e operação

.PHONY: help install dev test lint format pre-commit docker-build docker-up docker-down docker-logs clean

# Variáveis
PYTHON := python
PIP := pip
DOCKER_COMPOSE := docker-compose
PRE_COMMIT := pre-commit

# Comando padrão - mostra ajuda
help:
	@echo "Sistema Bancário DIO - Comandos Disponíveis:"
	@echo ""
	@echo "📦 Instalação e Configuração:"
	@echo "  make install          - Instala dependências do projeto"
	@echo "  make install-dev      - Instala dependências de desenvolvimento"
	@echo "  make setup-pre-commit - Configura pre-commit hooks"
	@echo ""
	@echo "🚀 Desenvolvimento:"
	@echo "  make dev              - Roda servidor em modo desenvolvimento"
	@echo "  make dev-reload       - Roda servidor com auto-reload"
	@echo ""
	@echo "🧪 Testes e Qualidade:"
	@echo "  make test             - Executa todos os testes"
	@echo "  make test-cov         - Executa testes com coverage"
	@echo "  make test-html        - Executa testes e gera relatório HTML"
	@echo "  make lint             - Executa linting (flake8, mypy)"
	@echo "  make format           - Formata código (black, isort)"
	@echo "  make pre-commit       - Executa pre-commit em todos os arquivos"
	@echo ""
	@echo "🐳 Docker:"
	@echo "  make docker-build     - Constrói imagens Docker"
	@echo "  make docker-up        - Inicia containers em background"
	@echo "  make docker-up-logs   - Inicia containers com logs"
	@echo "  make docker-down      - Para e remove containers"
	@echo "  make docker-logs      - Mostra logs dos containers"
	@echo "  make docker-restart   - Reinicia containers"
	@echo ""
	@echo "🧹 Limpeza:"
	@echo "  make clean            - Remove arquivos temporários"
	@echo "  make clean-docker     - Remove containers, volumes e imagens"
	@echo ""
	@echo "📊 Monitoramento:"
	@echo "  make status           - Mostra status dos containers"
	@echo "  make health           - Verifica saúde da aplicação"

# Instalação e Configuração
install:
	@echo "📦 Instalando dependências..."
	$(PIP) install -r requirements.txt

install-dev:
	@echo "📦 Instalando dependências de desenvolvimento..."
	$(PIP) install -r requirements.txt
	$(PIP) install pytest pytest-cov pytest-asyncio httpx pre-commit black isort flake8 mypy

setup-pre-commit:
	@echo "🔧 Configurando pre-commit hooks..."
	$(PRE_COMMIT) install
	$(PRE_COMMIT) autoupdate

# Desenvolvimento
dev:
	@echo "🚀 Iniciando servidor de desenvolvimento..."
	$(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000

dev-reload:
	@echo "🚀 Iniciando servidor com auto-reload..."
	$(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Testes e Qualidade
test:
	@echo "🧪 Executando testes..."
	$(PYTHON) -m pytest tests/ -v

test-cov:
	@echo "🧪 Executando testes com coverage..."
	$(PYTHON) -m pytest tests/ -v --cov=app --cov-report=term-missing

test-html:
	@echo "🧪 Executando testes e gerando relatório HTML..."
	$(PYTHON) -m pytest tests/ -v --cov=app --cov-report=html
	@echo "📊 Relatório disponível em: htmlcov/index.html"

lint:
	@echo "🔍 Executando linting..."
	$(PYTHON) -m flake8 app/ tests/
	$(PYTHON) -m mypy app/

format:
	@echo "✨ Formatando código..."
	$(PYTHON) -m black app/ tests/
	$(PYTHON) -m isort app/ tests/

pre-commit:
	@echo "🔧 Executando pre-commit..."
	$(PRE_COMMIT) run --all-files

# Docker
docker-build:
	@echo "🐳 Construindo imagens Docker..."
	$(DOCKER_COMPOSE) build

docker-up:
	@echo "🐳 Iniciando containers..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ Containers iniciados em background"
	@echo "📖 API: http://localhost:8000"
	@echo "📚 Docs: http://localhost:8000/docs"

docker-up-logs:
	@echo "🐳 Iniciando containers com logs..."
	$(DOCKER_COMPOSE) up

docker-down:
	@echo "🐳 Parando containers..."
	$(DOCKER_COMPOSE) down

docker-logs:
	@echo "📋 Mostrando logs dos containers..."
	$(DOCKER_COMPOSE) logs -f

docker-restart:
	@echo "🔄 Reiniciando containers..."
	$(DOCKER_COMPOSE) restart

# Limpeza
clean:
	@echo "🧹 Removendo arquivos temporários..."
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name ".coverage" -delete 2>/dev/null || true

clean-docker:
	@echo "🧹 Removendo containers, volumes e imagens..."
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans

# Monitoramento
status:
	@echo "📊 Status dos containers:"
	$(DOCKER_COMPOSE) ps

health:
	@echo "🏥 Verificando saúde da aplicação..."
	@curl -s http://localhost:8000/health | python -m json.tool || echo "❌ Aplicação não está respondendo"

# Comandos compostos
full-setup: install-dev setup-pre-commit
	@echo "✅ Setup completo finalizado!"

full-test: format lint test-cov
	@echo "✅ Todos os testes e verificações concluídos!"

full-deploy: clean docker-build docker-up
	@echo "✅ Deploy completo finalizado!"
	@echo "📖 API: http://localhost:8000"
	@echo "📚 Docs: http://localhost:8000/docs"

# Comandos de desenvolvimento rápido
quick-start: docker-up
	@echo "⚡ Início rápido concluído!"

quick-test: format test
	@echo "⚡ Teste rápido concluído!"