#!/usr/bin/env python3
"""
Script para testar a lógica corrigida do frontend
"""

import re

def detect_chave_type_corrected(chave):
    """Lógica corrigida do frontend"""
    trimmed_chave = chave.strip()
    
    # Email: contém @ e formato válido
    if re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', trimmed_chave):
        return 'email'
    
    # CPF: 11 dígitos numéricos (com ou sem formatação)
    only_numbers = re.sub(r'\D', '', trimmed_chave)
    if len(only_numbers) == 11 and re.match(r'^\d{11}$', only_numbers):
        return 'cpf'
    
    # Telefone: 10 ou 11 dígitos (com ou sem formatação)
    if ((len(only_numbers) == 10 and re.match(r'^\d{10}$', only_numbers)) or 
        (len(only_numbers) == 11 and re.match(r'^\d{11}$', only_numbers) and only_numbers[2] == '9')):
        return 'telefone'
    
    # Chave aleatória: UUID ou string alfanumérica
    return 'aleatoria'

def clean_chave_pix_frontend(chave, tipo=None):
    """Lógica de limpeza do frontend"""
    # Para CPF e telefone, remove todos os caracteres não numéricos
    if tipo == 'cpf' or tipo == 'telefone':
        return re.sub(r'\D', '', chave)
    # Para email, mantém como está
    if tipo == 'email':
        return chave.lower()
    # Para outros tipos, remove formatação geral
    return re.sub(r'[^\w@.-]', '', chave)

# Testes com CPFs formatados
test_cases = [
    '123.456.789-01',
    '12345678901',
    '123 456 789 01',
    '123-456-789-01',
    '(11) 99999-9999',
    '11999999999',
    '1199999999',  # telefone fixo
    'usuario@email.com',
    'abcd1234efgh5678ijkl9012mnop3456'
]

print("=== TESTE COM LÓGICA CORRIGIDA ===")  
for case in test_cases:
    tipo = detect_chave_type_corrected(case)
    limpo = clean_chave_pix_frontend(case, tipo)
    
    print(f"Original: {case:30} | Tipo: {tipo:10} | Limpo: {limpo}")

print("\n=== COMPARAÇÃO ANTES E DEPOIS ===")
problematic_cpf = '123.456.789-01'
print(f"CPF formatado: {problematic_cpf}")
print(f"Tipo detectado (corrigido): {detect_chave_type_corrected(problematic_cpf)}")
print(f"Resultado final: {clean_chave_pix_frontend(problematic_cpf, detect_chave_type_corrected(problematic_cpf))}")