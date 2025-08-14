menu = """

[nu] Novo usuário
[nc] Nova Conta
[d] Depositar
[s] Sacar
[e] Extrato
[q] Sair

=> """

saldo = 0
usuario = []
conta_cliente = []
limite = 500
extrato = ""
numero_saques = 0
LIMITE_SAQUES = 3
agencia = "0001"
n_conta = 1

def novo_usuario(cpf, nome, nascimento, endereco):
    global usuario
    usuario.append(cpf)
    usuario.append(f"Nome: {nome}")
    usuario.append(f"Data de nascimento: {nascimento}")
    usuario.append(f"Endereco: {endereco}")
    
    

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
    
    for user in usuario:
        print(user)
            
            
    print("\n================ EXTRATO ================")
    print("Não foram realizadas movimentações." if not extrato else extrato)
    print(f"\nSaldo: R$ {saldo:.2f}")
    print("==========================================")



while True:

    opcao = input(menu)

    if opcao == "nu":
        cpf = input("Digite seu cpf: ").strip() 
        for num in usuario:
            if num == cpf: 
                print(f"O CPF {cpf} já está cadastrado.")
                break 
        else:
            print(f"O CPF {cpf} NÃO foi encontrado. Cadastrando...")
            # usuario.append(cpf)
            print("CPF cadastrado com sucesso!")
            nome = input("Digite seu nome: \n")
            nascimento = input("Digite sua data de nascimento: \n")
            endereco = input("digite seu endereco: ")
            novo_usuario(cpf, nome, nascimento, endereco)
            # usuario.append(f"Nome: {nome}")
            # usuario.append(f"Data de nascimento: {nascimento}")
            # usuario.append(f"Endereco: {endereco}")
           

        print("\n---") 


    if opcao == "nc":
        cpf = input("Digite seu CPF: ")
        for valor in usuario:
            if valor == cpf:
                print("Cliente cadastrado \n")
                print(f"Com numero da conta: {n_conta} \n")
                print(f"Agência n° {agencia}")
                conta_cliente.append(cpf)
                conta_cliente.append(n_conta)
                conta_cliente.append(agencia)
                n_conta += 1
                break
        else:
            print("Cliente não cadastrado, cadatre-se primeiro")
            


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