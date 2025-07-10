import textwrap
from abc import ABC, abstractmethod, abstractproperty
from datetime import datetime
class Conta:
    def __init__(self, numero, cliente):
        self.__saldo = 0
        self.__numero = numero
        self.__agencia = "0001"
        self.__cliente = cliente
        self.__historico = Historico()
    

    @classmethod
    def nova_conta(cls, cliente, numero):
        return cls(numero, cliente)

    @property
    def saldo(self):
        return self.__saldo

    @property
    def numero(self):
        return self.__numero

    @property
    def agencia(self):
        return self.__agencia

    @property
    def cliente(self):
        return self.__cliente

    @property
    def historico(self):
        return self.__historico

    
    def sacar(self, valor):
        saldo = self.saldo
        excedeu_saldo = valor > saldo
        if excedeu_saldo:
            print("Operação falhou! Você não tem saldo suficiente.")
        elif valor > 0:
            self.__saldo -= valor
            print("\n=== Saque realizado com sucesso! ===")
            return True
      
        else:
            print("Operação falhou! O valor informado é inválido.")    
            return False
    
    def depositar(self, valor):
        if valor > 0:
            self.__saldo += valor
            print(f"Depósito de R$ {valor:.2f} realizado com sucesso!")
        else:
            print("Operação falhou! O valor informado é inválido.")
            return False
        return True

class ContaCorrente(Conta):
    def __init__(self,numero, cliente, limite=500, limite_saques=3):
        super().__init__(numero, cliente)
        self.__limite = limite
        self.__limites_saques = limite_saques
        self.__numero_saques = 0
        
    def sacar(self, valor):
        excedeu_limite = valor > self.__limite
        excedeu_saques = self.__numero_saques >= self.__limites_saques

        if excedeu_limite:
            print("Operação falhou! O valor do saque excede o limite.")
        elif excedeu_saques:
            print("Operação falhou! Número máximo de saques excedido.")
        else:
            self.__numero_saques += 1
            return super().sacar(valor)
        return False
    
    def __str__(self):
        return f"""\
            Agência:\t{self.agencia}
            C/C:\t\t{self.numero}
            Titular:\t{self.cliente.nome}
        """

class Cliente:
    def __init__(self, endereco):
        self.endereco = endereco
        self.contas = []
    
    
    def realizar_transacao(self, conta, transacao):
        transacao.registrar(conta)

    def adicionar_conta(self, conta):
        self.contas.append(conta)
   
class PessoaFisica(Cliente):
    def __init__(self, nome, data_nascimento, cpf, endereco):
        super().__init__(endereco)
        self.nome = nome
        self.data_nascimento = data_nascimento
        self.cpf = cpf
    
class Transacao(ABC):
    @property
    @abstractmethod
    def valor(self):
        pass
        
    @abstractmethod
    def registrar(self, conta):
        pass

class Deposito(Transacao):
    def __init__(self, valor):
        self._valor = valor

    @property
    def valor(self):
        return self._valor

    def registrar(self, conta):
        sucesso_transacao = conta.depositar(self.valor)

        if sucesso_transacao:
            conta.historico.adicionar_transacao(self)
    
class Saque(Transacao):
    def __init__(self, valor):
        self._valor = valor

    @property
    def valor(self):
        return self._valor

    def registrar(self, conta):
        sucesso_transacao = conta.sacar(self.valor)

        if sucesso_transacao:
            conta.historico.adicionar_transacao(self)
    
class Historico:
    def __init__(self):
        self._transacoes = []

    @property
    def transacoes(self):
        return self._transacoes

    def adicionar_transacao(self, transacao):
        self._transacoes.append(
            {
                "tipo": transacao.__class__.__name__,
                "valor": transacao.valor,
                "data": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            }
        )



menu = """

[nu] Novo usuário
[lu] Listar usuário
[nc] Nova Conta
[d] Depositar
[s] Sacar
[e] Extrato
[q] Sair

=> """

saldo = 0.0 




extrato = ""
numero_saques = 0



def buscar_usuario(cpf, lista_usuarios):
    for user in lista_usuarios:
        
        if user["cpf"] == cpf: 
            return user 
    return None 

def novo_usuario(clientes): 
    cpf = input("Digite o CPF (somente números): ").strip()
    if buscar_usuario(cpf, clientes):
        print(f"O CPF {cpf} já está cadastrado. Usuário existente.")
        return 

    nome = input("Digite seu nome: ").strip()
    nascimento = input("Digite sua data de nascimento (DD/MM/AAAA): ").strip()
    endereco = input("Digite seu endereço (logradouro, n° - bairro - cidade/estado): ").strip()

    
    novo_user = PessoaFisica(
        cpf=cpf,
        nome=nome,
        nasciment=nascimento,
        endereco=endereco
    )
    clientes.append(novo_user) 
    print("Usuário cadastrado com sucesso!")

def nova_conta(usuarios): 
    n_conta = Conta.__numero
    
    cpf = input("Digite o CPF do cliente para criar a conta: ").strip()
    
    usuario_existente = buscar_usuario(cpf, usuarios)

    if usuario_existente:
       
        nova_conta_dic = {
            "agencia": Conta.__agencia,
            "numero_conta": n_conta,
            "cpf": cpf 
        }
        Cliente.adicionar_conta(nova_conta_dic)
        print("\n--- Conta criada com sucesso! ---")
        print(f"Agência: {Conta.agencia}")
        print(f"Número da conta: {n_conta}")
        print(f"Cliente: {usuario_existente['nome']} (CPF: {cpf})")
        n_conta += 1 
    else:
        print("Cliente não cadastrado. Cadastre-se primeiro para criar uma conta.")

def extrato_conta(): 
    
    usuarios = Historico.transacoes
    
    print("\n============= USUÁRIOS CADASTRADOS =============\n")
    if not usuarios:
        print("Nenhum usuário cadastrado.")
    else:
        for user in usuarios: 
            print(f"CPF: {user['cpf']}")
            print(f"  Nome: {user['nome']}")
            print(f"  Nascimento: {user['nascimento']}")
            print(f"  Endereço: {user['endereco']}\n")

    print("\n============== CONTAS CADASTRADAS ==============\n")
    if not usuarios:
        print("Nenhuma conta cadastrada.")
    else:
        for conta in usuarios: 
            
            cliente_nome = "Desconhecido"
            for user in usuarios:
                if user["cpf"] == conta["cpf"]:
                    cliente_nome = user["nome"]
                    break
            print(f"Agência: {conta['agencia']} - Conta: {conta['numero_conta']}")
            print(f"  Cliente: {cliente_nome} (CPF: {conta['cpf']})\n")

    print("\n==================== EXTRATO ====================\n")
    print("Não foram realizadas movimentações." if not extrato else extrato)
    print(f"\nSaldo atual: R$ {saldo:.2f}")
    print("==================================================")

def listar_usuarios(): 
    print("\n============= LISTA DE USUÁRIOS ===============\n")
    if not usuarios:
        print("Nenhum usuário cadastrado.")
    else:
        for user_data in usuarios: 
            print(f"CPF: {user_data['cpf']}")
            print(f"  Nome: {user_data['nome']}")
            print(f"  Nascimento: {user_data['nascimento']}")
            print(f"  Endereço: {user_data['endereco']}\n")
    print("===============================================")
    
    print("\n============= LISTA DE CONTAS ===============\n")
    if not contas:
        print("Nenhuma conta cadastrada.")
    else:
        for conta_data in contas:
            cliente_nome = "Desconhecido"
            for user in usuarios:
                if user["cpf"] == conta_data["cpf"]:
                    cliente_nome = user["nome"]
                    break
            print(f"Agência: {conta_data['agencia']} - Conta: {conta_data['numero_conta']}")
            print(f"  Cliente: {cliente_nome} (CPF: {conta_data['cpf']})\n")
    print("===============================================")


while True:
    opcao = input(menu)

    if opcao == "nu":
        novo_usuario(clientes)

    elif opcao == "lu":
        listar_usuarios()

    elif opcao == "nc":
        nova_conta() 

    elif opcao == "d":
        valor = float(input("Informe o valor do depósito: R$ ").strip())
        Conta.depositar(valor) 
        Deposito.registrar(valor)
        print(f"Depósito de R$ {valor:.2f} realizado com sucesso!")

    elif opcao == "s":
            valor_saque = float(input("Informe o valor do saque: R$ ").strip())
            ContaCorrente.sacar(valor)
            Saque.registrar(valor)

    elif opcao == "e":
        extrato_conta()

    elif opcao == "q":
        break 

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")