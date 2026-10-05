from pypdf import PdfReader

reader = PdfReader(r"c:\VScode_projects\Funções do SHOP\Review 6.1514.pdf")
print(f"Total de paginas: {len(reader.pages)}")
with open(r"c:\VScode_projects\Funções do SHOP\pdf_content.txt", "w", encoding="utf-8") as f:
    for i, page in enumerate(reader.pages, 1):
        f.write(f"\n===== PAGINA {i} =====\n")
        f.write(page.extract_text() or "")
print("Extraido com sucesso!")
