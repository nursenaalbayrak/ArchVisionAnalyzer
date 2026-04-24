import pickle
import pandas as pd

# Model dosyanın adını buraya yaz
model_path = (
    "C:\\Users\\Nursena\\ArchVisionAnalyzer\\connectmodel\\clone_type_classifier.pkl"
)

with open(model_path, "rb") as f:
    model = pickle.load(f)

print("Model başarıyla yüklendi!")
print(f"Model tipi: {type(model)}")

try:
    with open(model_path, "rb") as f:
        # fix_imports ve encoding parametreleri sürüm farklarını bazen çözer
        model = pickle.load(f, encoding="latin1")
    print("Model başarıyla yüklendi!")
except Exception as e:
    print(f"Hata devam ediyor: {e}")
