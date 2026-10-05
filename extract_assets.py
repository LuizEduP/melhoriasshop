import pymupdf
import os

src = r"c:\VScode_projects\Funções do SHOP\Review 6.1514.pdf"
out_dir = r"c:\VScode_projects\Funções do SHOP\site\img"
os.makedirs(out_dir, exist_ok=True)

doc = pymupdf.open(src)

# xref -> nome de saida
assets = {
    43:  "logo-wshop.png",            # pagina 1  - logo
    66:  "nota-facil-atual.png",       # pagina 6  - interface atual
    71:  "nota-facil-nova.png",        # pagina 7  - nova interface
    76:  "producao-automatica.png",    # pagina 8  - producao automatica
    81:  "valor-min-parcela.png",      # pagina 9  - valor minimo parcela
    86:  "cnpj-alfanumerico.png",      # pagina 10 - CNPJ alfanumerico
    91:  "nota-debito-perda.png",      # pagina 11 - nota de debito (estoque)
    97:  "nota-debito-nfe.png",        # pagina 12 - nota de debito (NF-e)
    104: "nfe-devolucao.png",          # pagina 13 - NF-e devolucao
    111: "perfis-usuario.jpg",         # pagina 14 - perfis de usuario
    116: "ishop-indisponivel.jpg",     # pagina 15 - iShop produto indisponivel
    121: "ze-delivery.jpg",            # pagina 16 - Zeh Delivery via HUB
    135: "ifood-mercado.jpg",          # pagina 19 - iFood Mercado via HUB
    155: "whatsapp-anexo.png",         # pagina 23 - WhatsApp com anexo
    160: "cashback.png",               # pagina 24 - cashback no orcamento
}

for xref, name in assets.items():
    info = doc.extract_image(xref)
    with open(os.path.join(out_dir, name), "wb") as f:
        f.write(info["image"])
    print(f"{name}: {info['width']}x{info['height']} ({len(info['image'])} bytes)")

print("Extracao concluida!")
