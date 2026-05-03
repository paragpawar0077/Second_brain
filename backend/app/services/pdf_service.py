import fitz  

def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    pdf = fitz.open(file_path)
    for page in pdf:
        text_parts.append(page.get_text())
    pdf.close()
    return "\n".join(text_parts).strip()