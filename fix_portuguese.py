#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob

def fix_portuguese_errors():
    """Corrigir erros de português em todos os arquivos HTML"""
    
    # Mapeamento de correções
    corrections = {
        'a??o': 'ação',
        '?': 'é',
        'n?o': 'não',
        'ser?o': 'serão',
        'voc?': 'você',
        'ser? ': 'será ',
        'N?o': 'Não',
        'poss?vel': 'possível',
        'informa??es': 'informações',
        'ap?s': 'após',
        'exclus?o': 'exclusão',
        'Raz?o': 'Razão',
        'j?': 'já',
        'est?': 'está',
    }
    
    # Arquivos a processar
    html_files = glob.glob('src/views/*.html')
    
    for filepath in html_files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
            
            original = content
            
            # Aplicar todas as correções
            for old, new in corrections.items():
                content = content.replace(old, new)
            
            if content != original:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ {filepath} corrigido com sucesso!")
            
        except Exception as e:
            print(f"❌ Erro ao processar {filepath}: {e}")

if __name__ == "__main__":
    fix_portuguese_errors()
    print("\n✅ Todos os arquivos foram processados!")
