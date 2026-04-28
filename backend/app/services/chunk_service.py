import re

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 75):
    text = clean_text(text)
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk_words = words[start:end]
        if chunk_words:
            chunks.append(" ".join(chunk_words))
        start += chunk_size - overlap
    return chunks