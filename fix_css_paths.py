import os
import glob

# Lista de arquivos HTML em src/views
files = glob.glob('src/views/*.html')

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Substituir caminhos CSS relativos por caminhos absolutos
        updated_content = content.replace('href="../public/css/', 'href="/src/public/css/')
        
        if updated_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            print(f'✓ {f} - CSS paths fixed')
        else:
            print(f'- {f} - No changes needed')
    except Exception as e:
        print(f'✗ {f} - Error: {e}')

print('\nDone!')
