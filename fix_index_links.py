import re

# Ler o arquivo
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Mapeamento de caminhos para rotas Express
replacements = {
    './src/views/formu.html': '/formu.html',
    './src/views/cadastroem.html': '/cadastroem.html',
    './src/views/login.html': '/login',
    './src/views/dashboard.html': '/dashboard.html',
    './src/views/empregos.html': '/empregos.html',
    './src/views/sobre.html': '/sobre.html',
    './src/views/ajuda.html': '/ajuda.html',
    './src/views/Dev.html': '/Dev.html',
}

# Realizar replacements
updated_content = content
for old_path, new_route in replacements.items():
    updated_content = updated_content.replace(f'href="{old_path}"', f'href="{new_route}"')
    updated_content = updated_content.replace(f"'{old_path}'", f"'{new_route}'")
    updated_content = updated_content.replace(f'href="{old_path}', f'href="{new_route}')  # sem fecha

# Salvar o arquivo
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(updated_content)

print('✓ index.html - Updated all links to use Express routes')
