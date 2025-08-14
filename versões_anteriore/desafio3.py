from abc import ABC, abstractmethod
class Cliente:
    def __init__(self, endereco, contas):
        self.__endereco = endereco
        self.__contas = contas
    def realizar_transacoes(self):
        pass
    def adicionar_conta(self, conta):
        super().__init__(conta=Conta)
        return conta
class Transacao(Conta, ABC):
    @abstractmethod
    def registrar(self, conta):
        self.conta =Conta
class Historico(Transacao):
    def adicionar_transacao(self):
        self.transacao = Transacao
class Conta(Cliente, Historico):
    def __init__(self, saldo, numero, agencia, Cliente, Historico):
        self.__saldo = saldo
        self.__numero = numero
        self.__agencia = agencia
        self.__cliente = Cliente
        self.__historico = Historico
    
    def saldo(self):
        pass
    
    @classmethod
    def nova_conta(cls, contas):
        super().__init__(__numero= int, __cliente=Cliente)
        return cls(__numero=int,__cliente=Cliente)
    
    def sacar(self, valor):
        self.valor = valor
        
    def depositar(self, valor):
        self.valor = valor

class PessoaFisica:
    def __init__(self, cpf, nome, data_nascimento):
        self.__cpf = cpf
        self.__nome = nome
        self.data_nascimento = data_nascimento
class ContaCorrente:
    def __init__(self, limite, limite_saques):
        self.__limite = limite
        self.__limite_saques = limite_saques
    pass
class Saque:
    def __init__(self, valor):
        self.__valor = valor
class deposito:
    def __init__(self, valor):
        self.__valor = valor

