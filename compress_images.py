import os
from PIL import Image

def compress_images(directory):
    count = 0
    extensions_to_convert = ('.png', '.jpg', '.jpeg')
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(extensions_to_convert) and not file.lower().endswith('.webp'):
                file_path = os.path.join(root, file)
                filename_without_ext = os.path.splitext(file)[0]
                new_file_path = os.path.join(root, filename_without_ext + '.webp')
                
                if os.path.exists(new_file_path):
                    continue

                try:
                    with Image.open(file_path) as img:
                        if img.mode in ("RGBA", "P"):
                            img = img.convert("RGBA")
                        else:
                            img = img.convert("RGB")
                            
                        img.save(new_file_path, "webp", quality=85)
                    count += 1
                except Exception:
                    pass

if __name__ == "__main__":
    assets_dir = os.path.join(os.path.dirname(__file__), 'assets')
    compress_images(assets_dir)
