import os

files = ['index.html', 'gallery.html', 'about.html', '404.html']
favicon_tag = "    <link rel=\"icon\" type=\"image/svg+xml\" href=\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 50 50 L 100 20 A 50 50 0 1 0 100 80 Z' fill='%23FFD700'/%3E%3C/svg%3E\">\n"

for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            c = f.read()
        if 'rel=\"icon\"' not in c:
            c = c.replace('<head>', '<head>\n' + favicon_tag)
            with open(fn, 'w', encoding='utf-8') as f:
                f.write(c)

print('Injected Pacman URL encoded')
