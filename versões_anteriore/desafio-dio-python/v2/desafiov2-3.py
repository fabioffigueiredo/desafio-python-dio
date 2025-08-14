menu = """

[nu] Novo usuário
[nc] Nova Conta
[d] Depositar
[s] Sacar
[e] Extrato
[q] Sair

=> """

saldo = 0
usuario = {}
limite = 500
extrato = ""
numero_saques = 0
LIMITE_SAQUES = 3
cpf_list = []


def deposito(valor):
    global extrato
    global saldo
    saldo += valor
    extrato += f"Depósito: R$ {valor:.2f}\n"
    return saldo, extrato

def saque(valor):
    global saldo
    global limite
    global numero_saques
    global LIMITE_SAQUES
    global extrato    
    saldo -= valor
    extrato += f"Saque: R$ {valor:.2f}\n"
    numero_saques += 1
    return saldo, extrato

def extrato_conta():
    global saldo
    global extrato
    global cpf_list
    print ("\n=============Usuário==============\n")
    
    for user in cpf_list:
        print(user)
            
    print("\n================ EXTRATO ================")
    print("Não foram realizadas movimentações." if not extrato else extrato)
    print(f"\nSaldo: R$ {saldo:.2f}")
    print("==========================================")



while True:

    opcao = input(menu)

    if opcao == "nu":
        cpf = input("Digite seu cpf: ") # Bom usar .strip() para remover espaços extras
        # Começamos assumindo que o CPF NÃO foi encontrado
        

        for num in cpf_list:
            if num == cpf: # Se o CPF que estamos procurando já existe na lista
                print(f"O CPF {cpf} já está cadastrado.")
                break # MUITO IMPORTANTE: sai do loop 'for' assim que encontrar
        else:
            # Este bloco 'else' só é executado se o 'for' loop terminar sem um 'break'
            # Ou seja, se o CPF NÃO foi encontrado na lista inteira
            print(f"O CPF {cpf} NÃO foi encontrado. Cadastrando...")
            cpf_list.append(cpf) # Adiciona o novo CPF à lista
            print("CPF cadastrado com sucesso!")
            # Se você for pedir mais dados do usuário (nome, nascimento, etc.),
            # este é o lugar certo para fazer isso e armazená-los junto com o CPF.

        print("\n---") # Linha para separar as saídas
        # print("CPFs na lista:", cpf_list) # Linha para ver o resultado (apenas para teste)


    # if opcao == "nc":


    elif opcao == "d":
        valor = float(input("Informe o valor do depósito: "))

        if valor > 0:
            deposito(valor)
        else:
            print("Operação falhou! O valor informado é inválido.")

    elif opcao == "s":
        valor = float(input("Informe o valor do saque: "))

        excedeu_saldo = valor > saldo

        excedeu_limite = valor > limite

        excedeu_saques = numero_saques >= LIMITE_SAQUES

        if excedeu_saldo:
            print("Operação falhou! Você não tem saldo suficiente.")

        elif excedeu_limite:
            print("Operação falhou! O valor do saque excede o limite.")

        elif excedeu_saques:
            print("Operação falhou! Número máximo de saques excedido.")

        elif valor > 0:
            saque(valor)
           

        else:
            print("Operação falhou! O valor informado é inválido.")

    elif opcao == "e":
        extrato_conta()

    elif opcao == "q":
        break

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")