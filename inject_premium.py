import os

script_dir = os.path.dirname(__file__)
files = ['index.html', 'gallery.html', 'about.html']
for fn in files:
    filepath = os.path.join(script_dir, fn)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        
        if '<div class="noise-overlay"></div>' not in c:
            replacement = """<!-- Premium Elements -->
    <div class="noise-overlay"></div>
    <div class="page-transition"></div>
    <div class="scroll-progress-bar"></div>

    <!-- Custom Cursor -->"""
            c = c.replace('<!-- Custom Cursor -->', replacement)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(c)

print("Injected Premium HTML bases")
