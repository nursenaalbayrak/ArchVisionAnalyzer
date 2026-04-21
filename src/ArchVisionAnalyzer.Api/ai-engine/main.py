import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import RobertaForSequenceClassification, RobertaTokenizer

app = FastAPI()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# SİSTEMİN ÇALIŞMASI İÇİN STANDART CODEBERT
MODEL_NAME = "microsoft/codebert-base"

try:
    tokenizer = RobertaTokenizer.from_pretrained(MODEL_NAME)
    # 2 sınıflı (Klon/Orijinal) standart iskelet
    model = RobertaForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)
    model.to(device)
    model.eval()
    print("🚀 SİSTEM HAZIR! (Standart CodeBERT Aktif)")
except Exception as e:
    print(f"❌ Başlatma Hatası: {e}")


class CodePair(BaseModel):
    code1: str
    code2: str


@app.post("/analyze")
async def analyze_code(item: CodePair):
    # Cross-Encoder mantığıyla iki kodu birleştir
    inputs = tokenizer(
        item.code1,
        item.code2,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=-1)

        # Standart modelden gelen ham skor
        score = float(probs[0][1] * 100)
        label = "Clone" if score > 50 else "Original"

    return {
        "score": int(score),
        "label": label,
        "detail": f"CodeBERT Analizi: İki kod arasındaki anlamsal benzerlik %{int(score)}.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
