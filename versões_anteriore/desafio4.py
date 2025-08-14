from pydantic import BaseModel, constr, PositiveFloat
from rich.console import Console
from rich.table import Table
import argparse

console = Console()

# ===== Modelo de Conta Bancária =====
class ContaBancaria(BaseModel):
    nome: constr(min_length=3)
    cpf: constr(min_length=11, max_length=11)
    saldo: PositiveFloat = 0

    def depositar(self, valor: float):
        if valor <= 0:
            raise ValueError("O valor do depósito deve ser positivo.")
        self.saldo += valor
        console.print(f"💰 Depósito de R${valor:.2f} realizado com sucesso!", style="green")

    def sacar(self, valor: float):
        if valor <= 0:
            raise ValueError("O valor do saque deve ser positivo.")
        if valor > self.saldo:
            raise ValueError("Saldo insuficiente.")
        self.saldo -= valor
        console.print(f"💸 Saque de R${valor:.2f} realizado com sucesso!", style="yellow")

    def exibir_extrato(self):
        table = Table(title=f"Extrato - {self.nome}")
        table.add_column("CPF", style="cyan")
        table.add_column("Saldo Atual", style="magenta")
        table.add_row(self.cpf, f"R${self.saldo:.2f}")
        console.print(table)

# ===== CLI para rodar o sistema =====
def main():
    parser = argparse.ArgumentParser(description="Sistema Bancário CLI - Desafio DIO")
    parser.add_argument("--nome", required=True, help="Nome do cliente")
    parser.add_argument("--cpf", required=True, help="CPF do cliente (11 dígitos)")
    parser.add_argument("--saldo", type=float, default=0, help="Saldo inicial")
    args = parser.parse_args()

    try:
        conta = ContaBancaria(nome=args.nome, cpf=args.cpf, saldo=args.saldo)
        console.print(f"🏦 Conta criada para {conta.nome} com saldo inicial de R${conta.saldo:.2f}", style="cyan")

        # Exemplo de operações
        conta.depositar(1000)
        conta.sacar(250)
        conta.exibir_extrato()

    except ValueError as e:
        console.print(f"❌ Erro: {e}", style="bold red")

if __name__ == "__main__":
    main()