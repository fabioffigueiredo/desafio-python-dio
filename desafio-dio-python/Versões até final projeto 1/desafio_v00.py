menu = """

[d] Depositar
[s) Sacar 
[e] Extrato
[q] Sair

=>"""

saldo = 0
Limite = 500
extrato = ""
numero_saques = 0
limite_saques = 3

while True:



    opcao = input (menu)



    if opcao == "d":

        print("Depósito")



    elif opcao == "s":

        print( "Saque")



    elif opcao == "e":

        print ("Extrato")



    elif opcao == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")