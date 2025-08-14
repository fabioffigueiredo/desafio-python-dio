menu = """

[d] Depositar
[s) Sacar 
[e] Extrato
[q] Sair

=>"""

saldo = 0
Limite = 500
extrato = []
numero_saques = 0
limite_saques = 3
deposito = 0

while True:

    opcao = input (menu)
    print(f"\n Seu saldo é de: \n {saldo}") 
    
    if opcao == "d":
        print("Depósito")
        saldo
        deposito = int(input("Digite o valor a ser depositado: \n"))
        saldo += deposito
        depi = deposito
        extrato.append(depi)
        print(f"\nSeu saldo é de: \n {saldo}")

    elif opcao == "s":
        print( "Saque")


    elif opcao == "e":
        print ("Extrato")
        for depi in extrato:
            print(f"Deposito: {depi}")
        print(f"Seu saldo atual é de: {saldo}")


    elif opcao == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")






