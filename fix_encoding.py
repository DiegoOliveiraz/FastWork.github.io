#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os

def comprehensive_fix(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = content.replace('\ufffd', '')
        
        # Corrigir palavras com acentuação errada
        corrections = {
            'Construçãora': 'Construtora',
            'documenta??o': 'documentação',
            'voc?': 'você',
            'voc? ': 'você ',
            'informa??o': 'informação',
            'sess?o': 'sessão',
            'op??o': 'opção',
            'vers?o': 'versão',
            'solu??o': 'solução',
            'quest?o': 'questão',
            'condi??o': 'condição',
            'edi??o': 'edição',
            'fun??o': 'função',
            'posi??o': 'posição',
            'transa??o': 'transação',
            'aten??o': 'atenção',
            'descri??o': 'descrição',
            'situa??o': 'situação',
            'declara??o': 'declaração',
            'forma??o': 'formação',
            'valida??o': 'validação',
            'autoriza??o': 'autorização',
            'ativa??o': 'ativação',
            'cria??o': 'criação',
            'altera??o': 'alteração',
            'execu??o': 'execução',
            'composi??o': 'composição',
            'aplica??o': 'aplicação',
            'motiva??o': 'motivação',
            'recomenda??o': 'recomendação',
            'pr?': 'pré',
            '??es': 'ções',
            '??es': 'ções',
            '??es': 'ções',
        }
        
        for bad, good in corrections.items():
            if bad in content:
                content = content.replace(bad, good)
                print(f'  Corrigido: {bad} -> {good}')
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
                
    except Exception as e:
        print(f'Erro em {filepath}: {e}')
    return False

print("Corrigindo arquivo de encoding...")
count = 0
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.html', '.css', '.js')):
            filepath = os.path.join(root, file)
            if comprehensive_fix(filepath):
                count += 1
                print(f'Arquivo {count}: {filepath}')

print(f'\n✓ Total de arquivos corrigidos: {count}')
