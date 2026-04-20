from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class CodeSnippet(BaseModel):
    code: str


@app.post("/analyze")
async def analyze_code(item: CodeSnippet):
    # BURASI SENİN CODEBERT MODELİNİN GELECEĞİ YER
    # Şimdilik simüle ediyoruz:
    code_length = len(item.code)

    # Basit bir mantık: Kod çok uzunsa skoru düşürelim (örnek)
    score = 100 - (code_length % 50)

    return {
        "score": score,
        "label": "Cloned" if score < 70 else "Original",
        "detail": f"AI Engine: {code_length} karakter analiz edildi.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
