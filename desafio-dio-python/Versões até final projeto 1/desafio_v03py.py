menu = """

[d] Depositar
[s) Sacar 
[e] Extrato
[q] Sair

=>"""

saldo = 0
Limite = 500
extrato_saque = []
extrato_deposito = []
numero_saques = 0
LIMITE_SAQUES = 3
deposito = 0
saque = 0

while True:
    opcao = input(menu)
    print(f"\n Seu saldo é de: \n {saldo}") 
    
    if opcao.lower() == "d":
        print("Depósito")
        deposito = int(input("Digite o valor a ser depositado: \n"))
        saldo += deposito
        extrato_deposito.append(deposito)
        print(f"\nSeu saldo é de: \n {saldo}")

    elif opcao.lower() == "s":
        print( "Saque")
        if numero_saques < LIMITE_SAQUES:
            if saque <= Limite:
                saque = int(input("\nDigite o valor a ser sacado\n"))
                if saque <= saldo:
                    numero_saques += 1
                    print(f"\nSeu saque de R${saque} foi executado com sucesso!!!\n")
                    saldo -= saque
                    extrato_saque.append(saque)
                    print(f"\nSeu saldo é de: \n {saldo}")
                else:
                    print(f"\nSeu saldo de R${saldo} é insuficiente\n")
            else:
                print("Seu limite de saque é R$500,00 Reais")
        else:
            print("Limite de saques atingido!!!")

    elif opcao.lower() == "e":
        print ("Extrato")
        for valor in extrato_deposito:
            print(f"Deposito: {valor}\n")   
        for valor_1 in extrato_saque:
            print(f"Saque: {valor_1}\n")
        print(f"\nSeu saldo atual é de: {saldo}\n")


    elif opcao.lower() == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")
            



