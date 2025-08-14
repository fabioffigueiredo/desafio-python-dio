# 🏦 Desafio DIO Sistema Bancário em Python

Fomos contratados por um grande banco para desenvolver o seu novo sistema. Esse banco deseja modernizar suas operações e para isso escolheu a linguagem Python. Para a primeira versão do sistema devemos implementar apenas 3 operações: depósito, saque e extrato.

## 📝 Objetivo Geral

Criar um sistema bancário com as operações: sacar, depositar e visualizar extrato.

## 💷 Operação de depósito

Deve ser possível depositar valores positivos para a minha conta bancária. A vi do projeto trabalha apenas com 1 usuário, dessa forma não precisamos nos preocupar em identificar qual é o número da agência e conta bancária. Todos os depósitos devem ser armazenados em uma variável e exibidos na operação de extrato.

## 💸 Operação de saque

O sistema deve permitir realizar 3 saques diários com limite máximo de R$ 500,00 por saque. Caso o usuário não tenha saldo em conta, o sistema deve exibir uma mensagem informando que não será possível sacar o dinheiro por falta de saldo. Todos os saques devem ser armazenados em uma variável e exibidos na operação de extrato.

## 🖨️ Operação de extrato

Essa operação deve listar todos os depósitos e saques realizados na conta. No fim da listagem deve ser exibido o saldo atual da conta. Se o extrato estiver em branco, exibir a mensagem: Não foram realizadas movimentações.
Os valores devem ser exibidos utilizando o formato R$ xxx.xx, exemplo:
1500.45 = R$ 1500.45

# 💻 Descrição da solução do Desafio

Comecei copiando o Layout sugerido pelo professor. Logo após fui para operação de depósito, onde criei a variável "deposito", para receber o valor e posteriormente somar ao saldo.

Depois fui para o saque onde também criei uma variável como nome "saque" para receber o valor e depois subtrair do saldo.

Em extrato tive dificuldades em armazenar os valores e depois expor em uma lista. Para isso tive que fazer uma pesquisa na internet e usei o metódo "append" para inserir os depositos e saques na lista Extrato. Para mostrar os valorer eu utilizei um "for" para percorrer a lista e ir exibindo os valores.

Fora o que foi pedido, adicionei um contador para numerar cada opeção e depois exibir no extrato e adicionei a função "lower()" em option, para caso o usuário digite com letra maiúscula, ela seja transformada em minúscula e assim evite problema.

# Fabio Figueiredo

## Conecte-se comigo
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fabio-figueiredo-295a8191)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/fabioffigueiredo)
