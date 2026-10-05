import pymupdf
import os

src = r"c:\VScode_projects\Funções do SHOP\Review 6.1514.pdf"
out_dir = r"c:\VScode_projects\Funções do SHOP\slides_preview"
os.makedirs(out_dir, exist_ok=True)

doc = pymupdf.open(src)
for i in [15, 20, 21, 22, 23]:  # pages 16, 21, 22, 23, 24 (0-based)
    pix = doc[i].get_pixmap(dpi=60)
    pix.pil_save(os.path.join(out_dir, f"page_{i+1:02d}.jpg"), format="JPEG", quality=50)
print("OK")


