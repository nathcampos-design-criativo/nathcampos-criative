import os

script_dir = os.path.dirname(__file__)
gallery_file = os.path.join(script_dir, 'gallery.html')
kv_folder = os.path.join(script_dir, 'assets', 'KVS que eu gostei mas o cliente não')

# Collect .webp images
webp_files = []
if os.path.exists(kv_folder):
    for f in os.listdir(kv_folder):
        if f.endswith('.webp'):
            webp_files.append(f)

# Sort them alphabetically for consistency
webp_files.sort()

# Build HTML block
html_block = f"""
            <section class="gallery-page-hero" style="min-height: 20vh; padding-top: 5vh; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 5rem;" id="rejected-kvs">
                <h2 class="hero-title" style="font-size: var(--step-3); text-align: center;">Director's Cut</h2>
                <p style="text-align:center; color:#888; font-size:var(--step-0); margin-top:1rem; max-width:600px; margin-inline:auto;">Aquelas dezenas de Key Visuals que os clientes não compraram, mas nós amamos fazer.</p>
            </section>

            <section class="pure-gallery-grid-section">
                <div class="pure-gallery-grid">
"""

count = 0
for webp in webp_files:
    # Use span 2 on every 5th item for layout variety, like the main grid
    span_class = 'style="grid-column: span 2;" ' if count % 5 == 0 else ''
    
    img_path = f"assets/KVS que eu gostei mas o cliente não/{webp}"
    # Replace spaces strictly for html valid uri if needed, but modern browsers handle it
    title = webp.replace('.webp', '').replace('-', ' ')
    
    html_block += f"""
                    <div class="gallery-item case-trigger magnetic" data-cursor="KV" {span_class}>
                        <img src="{img_path}" alt="{title}" loading="lazy">
                        <div class="gallery-item-overlay">
                            <p class="gallery-item-category">Corte do Diretor</p>
                        </div>
                    </div>
"""
    count += 1

html_block += """
                </div>
            </section>
"""

# Read gallery.html
with open(gallery_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Determine where to insert (before the footer)
target_string = '            <footer class="footer section"'
if target_string in content and 'id="rejected-kvs"' not in content:
    content = content.replace(target_string, html_block + "\n" + target_string)
    
    with open(gallery_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Rejected KVs successfully injected into gallery.html")
else:
    print("Could not find insertion point or already injected.")
