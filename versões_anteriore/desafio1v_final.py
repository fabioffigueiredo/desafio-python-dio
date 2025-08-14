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
        print("\n===========Depósito===========\n")
        deposito = float(input("\nDigite o valor a ser depositado: \n"))
        print("\n==============================\n")
        if deposito > 0:
            saldo += deposito
            posicao += 1
            extrato.append(f"{posicao:02d} - Depósito: R${deposito: .2f}")
            print(f"\nSeu saldo é de: \n R${saldo: .2f} Reais")
        else:
            print("Deposite um valor positivo!!!")
    elif opcao.lower() == "s":
        print( "\n===========Saque===========\n")
        if numero_saques < LIMITE_SAQUES:
            saque = float(input("\nDigite o valor a ser sacado\n"))
            print("==========================")
            if saque <= Limite:
                if saque <= saldo:
                    numero_saques += 1
                    print(f"\n## Seu saque de R${saque: .2f} Reais foi executado com sucesso!!! ##\n")
                    saldo -= saque
                    posicao += 1
                    extrato.append(f"{posicao:02d} - Saque: R${saque: .2f}")
                    print(f"\nSeu saldo é de: R${saldo: .2f} Reais\n")
                else:
                    print("\n###Saque não realizado###\n")
                    print(f"\nSeu saldo de R${saldo: .2f} é insuficiente\n")
            else:
                print("\n####Seu limite de saque é R$500,00 Reais####\n")
        else:
            print("Limite de saques atingido!!!")

    elif opcao.lower() == "e":
        print ("\n=============Extrato==============\n")
        if not extrato:
            print("Não tem valor registrado")
        else:
            for valor in extrato:
                print(valor)
            print(f"\nSeu saldo atual é de: R${saldo: .2f} Reais\n")
            print("=====================================")


    elif opcao.lower() == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")
            