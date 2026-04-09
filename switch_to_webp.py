import re
import os

files_to_update = ['index.html', 'gallery.html', 'about.html', 'script.js']
script_dir = os.path.dirname(__file__)

for fname in files_to_update:
    filepath = os.path.join(script_dir, fname)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace .png, .jpg, .jpeg with .webp (case insensitive)
        updated_content = re.sub(r'(?i)\.(png|jpg|jpeg)', '.webp', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)

print("Updated HTML and JS files to point to .webp")
