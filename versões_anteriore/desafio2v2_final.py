menu = """

[nu] Novo usuário
[lu] Listar usuário
[nc] Nova Conta
[d] Depositar
[s] Sacar
[e] Extrato
[q] Sair

=> """

saldo = 0.0 
usuarios = [] 
contas = [] 

limite = 500.00 
extrato = ""
numero_saques = 0
LIMITE_SAQUES = 3 
AGENCIA = "0001" 
n_conta = 1 


def buscar_usuario(cpf, lista_usuarios):
    for user in lista_usuarios:
        
        if user["cpf"] == cpf: 
            return user 
    return None 

def novo_usuario(usuarios): 
    cpf = input("Digite o CPF (somente números): ").strip()
    if buscar_usuario(cpf, usuarios):
        print(f"O CPF {cpf} já está cadastrado. Usuário existente.")
        return 

    nome = input("Digite seu nome: ").strip()
    nascimento = input("Digite sua data de nascimento (DD/MM/AAAA): ").strip()
    endereco = input("Digite seu endereço (logradouro, n° - bairro - cidade/estado): ").strip()

    
    novo_user = {
        "cpf": cpf,
        "nome": nome,
        "nascimento": nascimento,
        "endereco": endereco
    }
    usuarios.append(novo_user) 
    print("Usuário cadastrado com sucesso!")

def nova_conta(contas, usuarios): 
    global n_conta 
    
    cpf = input("Digite o CPF do cliente para criar a conta: ").strip()
    
    usuario_existente = buscar_usuario(cpf, usuarios)

    if usuario_existente:
       
        nova_conta_dic = {
            "agencia": AGENCIA,
            "numero_conta": n_conta,
            "cpf": cpf 
        }
        contas.append(nova_conta_dic)
        print("\n--- Conta criada com sucesso! ---")
        print(f"Agência: {AGENCIA}")
        print(f"Número da conta: {n_conta}")
        print(f"Cliente: {usuario_existente['nome']} (CPF: {cpf})")
        n_conta += 1 
    else:
        print("Cliente não cadastrado. Cadastre-se primeiro para criar uma conta.")

def deposito(valor):
    global extrato
    global saldo
    saldo += valor
    extrato += f"Depósito: R$ {valor:.2f}\n"
    print(f"Depósito de R$ {valor:.2f} realizado com sucesso!")
    return saldo, extrato

def saque(*, valor): 
    global saldo
    global limite
    global numero_saques
    global extrato
    
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
        saldo -= valor
        extrato += f"Saque: R$ {valor:.2f}\n"
        numero_saques += 1
        print(f"Saque de R$ {valor:.2f} realizado com sucesso!")
    else:
        print("Operação falhou! O valor informado é inválido.")    
    return saldo, extrato

def extrato_conta(): 
    global usuarios 
    global contas 
    
    print("\n============= USUÁRIOS CADASTRADOS =============\n")
    if not usuarios:
        print("Nenhum usuário cadastrado.")
    else:
        for user in usuarios: 
            print(f"CPF: {user['cpf']}")
            print(f"  Nome: {user['nome']}")
            print(f"  Nascimento: {user['nascimento']}")
            print(f"  Endereço: {user['endereco']}\n")

    print("\n============== CONTAS CADASTRADAS ==============\n")
    if not contas:
        print("Nenhuma conta cadastrada.")
    else:
        for conta in contas: 
            
            cliente_nome = "Desconhecido"
            for user in usuarios:
                if user["cpf"] == conta["cpf"]:
                    cliente_nome = user["nome"]
                    break
            print(f"Agência: {conta['agencia']} - Conta: {conta['numero_conta']}")
            print(f"  Cliente: {cliente_nome} (CPF: {conta['cpf']})\n")

    print("\n==================== EXTRATO ====================\n")
    print("Não foram realizadas movimentações." if not extrato else extrato)
    print(f"\nSaldo atual: R$ {saldo:.2f}")
    print("==================================================")

def listar_usuarios(): 
    print("\n============= LISTA DE USUÁRIOS ===============\n")
    if not usuarios:
        print("Nenhum usuário cadastrado.")
    else:
        for user_data in usuarios: 
            print(f"CPF: {user_data['cpf']}")
            print(f"  Nome: {user_data['nome']}")
            print(f"  Nascimento: {user_data['nascimento']}")
            print(f"  Endereço: {user_data['endereco']}\n")
    print("===============================================")
    
    print("\n============= LISTA DE CONTAS ===============\n")
    if not contas:
        print("Nenhuma conta cadastrada.")
    else:
        for conta_data in contas:
            cliente_nome = "Desconhecido"
            for user in usuarios:
                if user["cpf"] == conta_data["cpf"]:
                    cliente_nome = user["nome"]
                    break
            print(f"Agência: {conta_data['agencia']} - Conta: {conta_data['numero_conta']}")
            print(f"  Cliente: {cliente_nome} (CPF: {conta_data['cpf']})\n")
    print("===============================================")



while True:
    opcao = input(menu)

    if opcao == "nu":
        novo_usuario(usuarios) 

    elif opcao == "lu":
        listar_usuarios()

    elif opcao == "nc":
        nova_conta(contas, usuarios) 

    elif opcao == "d":
        valor = float(input("Informe o valor do depósito: R$ ").strip())
        if valor > 0:
            deposito(valor) 
        else:
            print("Operação falhou! O valor informado é inválido.")

    elif opcao == "s":
            valor_saque = float(input("Informe o valor do saque: R$ ").strip())
            saque(valor=valor_saque) 

    elif opcao == "e":
        extrato_conta()

    elif opcao == "q":
        break 

    else:
        print("Operação inválida, por favor selecione novamente a operação desejada.")
