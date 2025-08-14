menu = """

[d] Depositar
[s) Sacar 
[e] Extrato
[q] Sair

=>"""

saldo = 0.0
Limite = 500.0
extrato_saque = []
extrato_deposito = []
numero_saques = 0
LIMITE_SAQUES = 3
deposito = 0.0
saque = 0.0

while True:
    opcao = input(menu)
    print(f"\n Seu saldo é de:  R${saldo: .2f} Reais\n") 
    
    if opcao.lower() == "d":
        print("\nDepósito\n")
        deposito = float(input("Digite o valor a ser depositado: \n"))
        saldo += deposito
        extrato_deposito.append(deposito)
        print(f"\nSeu saldo é de: \n R${saldo: .2f} Reais")

    elif opcao.lower() == "s":
        print( "\nSaque\n")
        if numero_saques < LIMITE_SAQUES:
            saque = float(input("\nDigite o valor a ser sacado\n"))
            if saque <= Limite:
                
                if saque <= saldo:
                    numero_saques += 1
                    print(f"\nSeu saque de R${saque: .2f} Reais foi executado com sucesso!!!\n")
                    saldo -= saque
                    extrato_saque.append(saque)
                    print(f"\nSeu saldo é de: R${saldo: .2f} Reais\n")
                else:
                    print(f"\nSeu saldo de R${saldo: .2f} é insuficiente\n")
            else:
                print("Seu limite de saque é R$500,00 Reais")
        else:
            print("Limite de saques atingido!!!")

    elif opcao.lower() == "e":
        print ("\nExtrato\n")
        for valor in extrato_deposito:
            print(f"Deposito: R${valor: .2f} Reais\n")   
        for valor_1 in extrato_saque:
            print(f"Saque: R${valor_1} Reais\n")
        print(f"\nSeu saldo atual é de: R${saldo: .2f} Reais\n")


    elif opcao.lower() == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")