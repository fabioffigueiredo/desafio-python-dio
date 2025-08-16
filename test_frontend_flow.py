import requests
import json

# Configuração da API
BASE_URL = "http://localhost:8000"

def test_login_and_accounts():
    """Testa o fluxo completo de login e carregamento de contas"""
    
    # 1. Fazer login
    login_data = {
        "cpf": "11144477735",
        "senha": "123456"
    }
    
    print("1. Fazendo login...")
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print(f"Erro no login: {response.status_code} - {response.text}")
        return
    
    auth_data = response.json()
    token = auth_data["access_token"]
    print(f"Login bem-sucedido! Token: {token[:50]}...")
    
    # 2. Carregar contas
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n2. Carregando contas...")
    response = requests.get(f"{BASE_URL}/contas/", headers=headers)
    
    if response.status_code != 200:
        print(f"Erro ao carregar contas: {response.status_code} - {response.text}")
        return
    
    contas = response.json()
    print(f"Contas carregadas: {len(contas)} conta(s)")
    
    for conta in contas:
        print(f"  - Conta {conta['numero']}: {conta['tipo_conta']} - Saldo: R$ {conta['saldo']}")
    
    # 3. Testar extrato se houver contas
    if contas:
        conta_numero = contas[0]['numero']
        print(f"\n3. Carregando extrato da conta {conta_numero}...")
        
        response = requests.get(f"{BASE_URL}/transacoes/{conta_numero}/extrato", headers=headers)
        
        if response.status_code != 200:
            print(f"Erro ao carregar extrato: {response.status_code} - {response.text}")
            return
        
        extrato = response.json()
        print(f"Extrato carregado: {len(extrato['transacoes'])} transação(ões)")
        
        for transacao in extrato['transacoes'][:5]:  # Mostrar apenas as 5 primeiras
            print(f"  - {transacao['tipo']}: R$ {transacao['valor']} - {transacao['created_at']}")
    
    print("\n✅ Teste concluído com sucesso!")

if __name__ == "__main__":
    try:
        test_login_and_accounts()
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")