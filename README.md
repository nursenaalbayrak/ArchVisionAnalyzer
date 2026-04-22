# ArchVisionAnalyzer
#  ArchVision AI: Code Clone Detection System

Bu proje, yazılım geliştirmede kod tekrarlarını ve olası intihalleri tespit etmek amacıyla geliştirilmiş bir analiz platformudur. Tez konum olan code-clonelarının tespit edilmesinde eğittiğim modeli kullanarak geliştirdim. 

## 🚀 Canlı Linkler
* **Frontend (Vercel):** (https://arch-vision-analyzer.vercel.app/)
* **Backend API (Render):** (https://archvision-api.onrender.com)

## 🛠️ Teknolojiler
* **Frontend:** React, Vite, TypeScript, CSS3
* **Backend:** .NET 8.0 Web API, Entity Framework Core
* **Veritabanı:** PostgreSQL (Supabase)
* **Analiz Motoru:** Python (CodeBERT & Cosine Similarity - *Entegrasyon aşamasında*)
* **Deployment:** Vercel, Render

## ✨ Özellikler
* **JWT Auth:** Güvenli kullanıcı kayıt ve giriş sistemi.
* **Kod Analizi:** İki farklı kod bloğu arasındaki benzerlik oranını hesaplama.
* **Geçmiş:** Geçmişte yapılan analizleri veritabanından çekme ve listeleme.
* **İstatistikler:** Kullanıcı bazlı toplam analiz ve kopya oranı verileri.
* **Cloud Native:** Tamamen bulut tabanlı mimari.

## 📸 Ekran Görüntüleri
*entegrasyon aşamasında*

## 🏗️ Kurulum
1. Repoyu klonlayın: `git clone https://github.com/nursenaalbayrak/ArchVisionAnalyzer.git`
2. Backend için: `dotnet run` (Gerekli ConnectionString ayarlarını yapın)
3. Frontend için: `npm install` ve `npm run dev`

