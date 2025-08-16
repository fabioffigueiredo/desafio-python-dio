import requests
import json

def test_react_flow():
    """Simula exatamente o fluxo do React"""
    base_url = "http://localhost:8000"
    
    print("=== TESTE DO FLUXO REACT ===")
    
    # 1. Login (como o useAuth faz)
    print("\n1. Fazendo login...")
    login_response = requests.post(
        f"{base_url}/auth/login",
        json={"cpf": "11144477735", "senha": "123456"},
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.status_code} - {login_response.text}")
        return
    
    login_data = login_response.json()
    token = login_data["access_token"]
    print(f"✅ Login OK! Token: {token[:20]}...")
    
    # 2. Buscar dados do usuário (como o useAuth faz)
    print("\n2. Buscando dados do usuário...")
    user_response = requests.get(
        f"{base_url}/auth/me",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    if user_response.status_code != 200:
        print(f"❌ Erro ao buscar usuário: {user_response.status_code} - {user_response.text}")
        return
    
    user_data = user_response.json()
    print(f"✅ Usuário: {user_data['nome']} (ID: {user_data['id']})")
    
    # 3. Buscar contas (como o useSelectedAccount faz)
    print("\n3. Buscando contas...")
    contas_response = requests.get(
        f"{base_url}/contas/",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    
    print(f"Status da resposta: {contas_response.status_code}")
    print(f"Headers da resposta: {dict(contas_response.headers)}")
    
    if contas_response.status_code != 200:
        print(f"❌ Erro ao buscar contas: {contas_response.status_code}")
        print(f"Texto da resposta: {contas_response.text}")
        return
    
    try:
        contas_data = contas_response.json()
        print(f"✅ Contas encontradas: {len(contas_data)}")
        for conta in contas_data:
            print(f"  - Conta {conta['numero']}: {conta['tipo_conta']} - Saldo: R$ {conta['saldo']}")
            
        # 4. Testar extrato da primeira conta
        if contas_data:
            primeira_conta = contas_data[0]
            print(f"\n4. Testando extrato da conta {primeira_conta['numero']}...")
            
            extrato_response = requests.get(
                f"{base_url}/transacoes/{primeira_conta['numero']}/extrato",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if extrato_response.status_code == 200:
                extrato_data = extrato_response.json()
                print(f"✅ Extrato OK: {len(extrato_data.get('transacoes', []))} transações")
            else:
                print(f"❌ Erro no extrato: {extrato_response.status_code} - {extrato_response.text}")
                
    except json.JSONDecodeError as e:
        print(f"❌ Erro ao decodificar JSON: {e}")
        print(f"Resposta bruta: {contas_response.text}")
    
    print("\n=== TESTE CONCLUÍDO ===")

if __name__ == "__main__":
    test_react_flow()