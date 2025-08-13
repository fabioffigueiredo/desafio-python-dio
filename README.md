# 💳 Sistema Bancário em Python

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-ativo-brightgreen.svg)]()

Um sistema bancário simples, desenvolvido em Python, como parte do **Desafio DIO**.  
O objetivo é praticar **lógica de programação**, **estruturação de código** e **boas práticas**, simulando operações comuns do dia a dia bancário.

---

## 🚀 Funcionalidades

- Criar conta bancária com dados do cliente (nome, CPF, saldo inicial).
- Depósitos com atualização automática de saldo.
- Saques com verificação de limite e saldo disponível.
- Transferências entre contas mantendo integridade de dados.
- Interface em linha de comando (CLI) para interação rápida.

---

## 🛠️ Tecnologias e bibliotecas

Embora o projeto original utilize apenas recursos nativos do Python, foram consideradas bibliotecas amplamente usadas no mercado para expansão e profissionalização:

- **[Python 3.10+](https://www.python.org/)** – linguagem principal.
- **[pytest](https://docs.pytest.org/)** – para testes automatizados.
- **[pydantic](https://docs.pydantic.dev/)** – validação de dados.
- **[rich](https://github.com/Textualize/rich)** – formatação bonita no terminal.
- **[argparse](https://docs.python.org/3/library/argparse.html)** – argumentos de linha de comando.

> Essas bibliotecas podem ser instaladas via `pip install -r requirements.txt` caso queira testar as versões expandidas.

---

## 📂 Estrutura do projeto

desafio-python-dio/
│
├── desafio1.py # Primeira versão
├── desafio1v_final.py # Versão final da primeira etapa
├── desafio2.py # Segunda versão
├── desafio2v2_final.py # Versão final da segunda etapa
├── desafio3.py # Terceira versão
├── desafio_v3.py # Versão final
├── Projeto 1.md # Documentação etapa 1
├── projeto2.md # Documentação etapa 2
├── projeto3.md # Documentação etapa 3
└── README.md # Este arquivo

---

## 📦 Como clonar e executar

1. **Clonar o repositório**

git clone https://github.com/fabioffigueiredo/desafio-python-dio.git
cd desafio-python-dio

**2. Criar ambiente virtual (recomendado)**
 
python3 -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

**3. Instalar dependências (opcional)**

pip install -r requirements.txt

**4. Executar**

python desafio1v_final.py


📈 Possíveis melhorias
Persistência de dados em banco de dados (SQLite/PostgreSQL).

API REST com FastAPI para integração com sistemas externos.

Interface gráfica (GUI) com Tkinter ou PySide6.

Exportação de extratos em PDF ou Excel.

🤝 Contribuindo
Contribuições são bem-vindas!

Faça um fork do projeto.

Crie uma branch com sua feature (git checkout -b minha-feature).

Commit suas alterações (git commit -m 'Adiciona minha feature').

Envie para o repositório remoto (git push origin minha-feature).

Abra um Pull Request.

📜 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

