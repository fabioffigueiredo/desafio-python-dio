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
        while True: # Loop contínuo até que o usuário decida sair
            try:
            # Pede o CPF e tenta convertê-lo para int.
            # Adicionei um prompt claro para o usuário.
                cpf_str = input("Informe seu CPF (ou 'sair' para finalizar): ").strip()

                

                cpf = int(cpf_str) # Converte o CPF para inteiro

                # Verifica se o CPF já existe como uma chave no dicionário 'usuarios'
                if cpf in usuario:
                    print("Usuário existente.")
                    # Opcional: mostrar os dados do usuário existente
                    print("Dados:", usuario[cpf])
                else:
                    # Se o CPF não existe, pede os outros dados
                    print("CPF não encontrado. Cadastrando novo usuário...")
                    nome = input("Informe seu nome: ").strip()
                    nascimento = input("Informe sua data de nascimento (DD/MM/AAAA): ").strip()
                    endereco = input("Informe seu endereço completo: ").strip()

                    # Cria um dicionário para o novo usuário com seus detalhes
                    novo_usuario_dados = {
                    "nome": nome,
                    "nascimento": nascimento,
                    "endereco": endereco
                    }
            
                    # Adiciona o novo usuário ao dicionário principal 'usuarios',
                    # usando o CPF como chave
                    usuario[cpf] = novo_usuario_dados
                    print("Usuário cadastrado com sucesso!")
                    break
            except ValueError:
                # Captura o erro se o CPF não puder ser convertido para um número inteiro
                print("Erro: CPF inválido. Por favor, digite apenas números para o CPF.")
            except Exception as e:
                # Captura quaisquer outros erros inesperados
                print(f"Ocorreu um erro inesperado: {e}")


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