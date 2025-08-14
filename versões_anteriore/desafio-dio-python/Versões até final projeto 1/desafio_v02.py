menu = """

[d] Depositar
[s) Sacar 
[e] Extrato
[q] Sair

=>"""

saldo = 0.0
Limite = 500.0
extrato = []
numero_saques = 0
LIMITE_SAQUES = 3
posicao = 0

while True:
    opcao = input(menu)
    print(f"\n Seu saldo é de:  R${saldo: .2f} Reais\n") 
    
    if opcao.lower() == "d":
        print("\nDepósito\n")
        deposito = float(input("Digite o valor a ser depositado: \n"))
        saldo += deposito
        posicao += 1
        extrato.append(f"{posicao:02d} - Depósito: R${deposito: .2f}")
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
                    posicao += 1
                    extrato.append(f"{posicao:02d} - Saque: R${saque: .2f}")
                    print(f"\nSeu saldo é de: R${saldo: .2f} Reais\n")
                else:
                    print(f"\nSeu saldo de R${saldo: .2f} é insuficiente\n")
            else:
                print("Seu limite de saque é R$500,00 Reais")
        else:
            print("Limite de saques atingido!!!")

    elif opcao.lower() == "e":
        print ("\nExtrato\n")
        for valor in extrato:
            print(valor)
        print(f"\nSeu saldo atual é de: R${saldo: .2f} Reais\n")


    elif opcao.lower() == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")
        
       
                