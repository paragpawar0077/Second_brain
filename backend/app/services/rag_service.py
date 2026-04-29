import requests
from app.core.config import settings

def build_context(chunks: list) -> str:
    """Combine retrieved chunks into one context block."""
    return "\n\n---\n\n".join(chunks)

def answer_with_groq(question: str, context: str) -> str:
    """Send question + context to Groq LLM and get answer."""
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    prompt = f"""You are a helpful personal knowledge assistant.
Use ONLY the provided context to answer the question.
If the answer is not found in the context, say exactly:
"I couldn't find that information in your documents."
Do not make up any information.

Context from user's documents:
{context}

Question: {question}

Answer:"""

    body = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that answers questions based only on provided context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3,
        "max_tokens": 512
    }

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=body,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    except requests.exceptions.Timeout:
        return fallback_answer(question, [context])
    except requests.exceptions.HTTPError as e:
        return f"Groq API error: {str(e)}"
    except Exception as e:
        return fallback_answer(question, [context])

def fallback_answer(question: str, chunks: list) -> str:
    """Used when Groq is unavailable — returns best matching chunk."""
    if not chunks:
        return "No relevant content found in your documents."
    return f"Based on your documents: {chunks[0][:500]}..."