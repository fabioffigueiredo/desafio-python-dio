import textwrap
from abc import ABC, abstractmethod
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
            self.__saldo -= valor # Acesso correto ao atributo privado
            print("\n=== Saque realizado com sucesso! ===")
            return True
        else:
            print("Operação falhou! O valor informado é inválido.")    
            return False
    
    def depositar(self, valor):
        if valor > 0:
            self.__saldo += valor # Acesso correto ao atributo privado
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
        return textwrap.dedent(f"""\
            Agência:\t{self.agencia}
            C/C:\t\t{self.numero}
            Titular:\t{self.cliente.nome}
        """)

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


def exibir_menu():
    menu_str = """\n
    ================ MENU ================
    [d]\tDepositar
    [s]\tSacar
    [e]\tExtrato
    [nc]\tNova conta
    [lc]\tListar contas
    [nu]\tNovo usuário
    [lu]\tListar usuários
    [q]\tSair
    => """
    return input(textwrap.dedent(menu_str))

def buscar_usuario(cpf, clientes):
    for cliente in clientes:
        if cliente.cpf == cpf: 
            return cliente
    return None

def recuperar_conta_cliente(cliente):
   
    if not cliente.contas:
        print("\n@@@ Cliente não possui conta! @@@")
        return None
    return cliente.contas[0]


def depositar_operacao(clientes): 
    cpf = input("Informe o CPF do cliente: ")
    cliente = buscar_usuario(cpf, clientes)

    if not cliente:
        print("\n@@@ Cliente não encontrado! @@@")
        return

    valor = float(input("Informe o valor do depósito: "))
    transacao = Deposito(valor) 

    conta = recuperar_conta_cliente(cliente)
    if not conta:
        return

    cliente.realizar_transacao(conta, transacao) 

def sacar_operacao(clientes): 
    cpf = input("Informe o CPF do cliente: ")
    cliente = buscar_usuario(cpf, clientes)

    if not cliente:
        print("\n@@@ Cliente não encontrado! @@@")
        return

    valor = float(input("Informe o valor do saque: "))
    transacao = Saque(valor) 

    conta = recuperar_conta_cliente(cliente)
    if not conta:
        return

    cliente.realizar_transacao(conta, transacao) 

def exibir_extrato(clientes):
    cpf = input("Informe o CPF do cliente: ")
    cliente = buscar_usuario(cpf, clientes)

    if not cliente:
        print("\n@@@ Cliente não encontrado! @@@")
        return

    conta = recuperar_conta_cliente(cliente)
    if not conta:
        return

    print("\n================ EXTRATO ================")
    transacoes = conta.historico.transacoes 

    extrato_formatado = ""
    if not transacoes:
        extrato_formatado = "Não foram realizadas movimentações."
    else:
        for transacao_item in transacoes:
            extrato_formatado += f"\n{transacao_item['tipo']}:\n\tR$ {transacao_item['valor']:.2f}"

    print(extrato_formatado)
    print(f"\nSaldo:\n\tR$ {conta.saldo:.2f}")
    print("==========================================")

def criar_cliente(clientes): 
    cpf = input("Digite o CPF (somente números): ").strip()
    if buscar_usuario(cpf, clientes): 
        print(f"O CPF {cpf} já está cadastrado. Usuário existente.")
        return 

    nome = input("Digite seu nome: ").strip()
    data_nascimento = input("Digite sua data de nascimento (DD/MM/AAAA): ").strip() 
    endereco = input("Digite seu endereço (logradouro, n° - bairro - cidade/estado): ").strip()

    
    novo_user = PessoaFisica(
        nome=nome,
        data_nascimento=data_nascimento, 
        cpf=cpf,
        endereco=endereco
    )
    clientes.append(novo_user) 
    print("Usuário cadastrado com sucesso!")   

def criar_conta(numero_conta_atual, clientes, contas):
    cpf = input("Informe o CPF do cliente: ")
    cliente = buscar_usuario(cpf, clientes) 

    if not cliente:
        print("\n@@@ Cliente não encontrado, fluxo de criação de conta encerrado! @@@")
        return

    
    conta = ContaCorrente.nova_conta(cliente=cliente, numero=numero_conta_atual)
    contas.append(conta) 
    cliente.adicionar_conta(conta) 

    print("\n=== Conta criada com sucesso! ===")

def listar_contas(contas): 
    if not contas:
        print("\n@@@ Nenhuma conta cadastrada. @@@")
        return
    for conta in contas:
        print("=" * 100)
        print(conta) 

def listar_usuarios(clientes): 
    print("\n============= LISTA DE USUÁRIOS ===============\n")
    if not clientes:
        print("Nenhum usuário cadastrado.")
    else:
        for cliente_obj in clientes: 
            print(f"CPF: {cliente_obj.cpf}")
            print(f"  Nome: {cliente_obj.nome}")
            print(f"  Nascimento: {cliente_obj.data_nascimento}")
            print(f"  Endereço: {cliente_obj.endereco}\n")
    print("===============================================")


def main():
    clientes = []
    contas = []
    
    while True:
        opcao = exibir_menu() 

        if opcao == "d":
            depositar_operacao(clientes) 

        elif opcao == "s":
            sacar_operacao(clientes) 

        elif opcao == "e":
            exibir_extrato(clientes) 

        elif opcao == "nu":
            criar_cliente(clientes) 

        elif opcao == "nc":
            numero_conta = len(contas) + 1
            criar_conta(numero_conta, clientes, contas) 

        elif opcao == "lc":
            listar_contas(contas) 

        elif opcao == "lu": 
            listar_usuarios(clientes) 

        elif opcao == "q":
            break

        else:
            print("\n@@@ Operação inválida, por favor selecione novamente a operação desejada. @@@")


main()