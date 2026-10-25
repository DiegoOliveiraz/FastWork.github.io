#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob

def fix_login_routes():
    """Corrigir rotas no login.html"""
    filepath = "src/views/login.html"
    
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        original = content
        
        # Corrigir rotas relativas para absolutas
        replacements = {
            'href="formu.html"': 'href="/src/views/formu.html"',
            'href="cadastroem.html"': 'href="/src/views/cadastroem.html"',
            'window.location.href = "/"': 'window.location.href = "/index.html"',
        }
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {filepath} corrigido com sucesso!")
        else:
            print(f"ℹ️  Nenhuma mudança necessária em {filepath}")
            
    except Exception as e:
        print(f"❌ Erro ao processar {filepath}: {e}")

if __name__ == "__main__":
    fix_login_routes()
