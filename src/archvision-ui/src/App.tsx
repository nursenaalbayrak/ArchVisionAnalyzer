import { useState } from 'react'
import './App.css'

// 1. Tip Tanımlaması (Interface)
interface AnalysisResponse {
  fileName: string;
  status: string;
  score: number;
  message: string;
}

function App() {
  // 2. State Tanımlamaları
  const [code, setCode] = useState<string>("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Eksik olan loading state eklendi

  // 3. Backend ile İletişim Fonksiyonu
  const handleAnalyze = async () => {
    if (!code.trim()) {
      alert("Lütfen önce bir kod yapıştırın!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5018/api/analysis/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(code) 
      });

      if (!response.ok) throw new Error("Backend bağlantı hatası");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analiz başarısız!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header style={{ padding: '20px' }}>
        <h1>ArchVisionAnalyzer</h1>
        <p>Software Architecture & AI Analysis Tool</p>
      </header>

      <main>
        {/* 4. Kod Giriş Alanı */}
        <div style={{ marginBottom: '20px' }}>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Analiz edilecek kodu buraya yapıştırın..."
            style={{ width: '80%', height: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
        </div>

        <div className="card">
          <button 
            onClick={handleAnalyze} 
            disabled={loading}
            style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '16px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
          >
            {loading ? 'Analiz Ediliyor...' : 'Kodu Analiz Et'}
          </button>
        </div>

        {/* 5. Sonuç Tablosu */}
        <div className="results-container" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          {result ? (
            <table style={{ width: '80%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f4f4' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Dosya Adı</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Durum</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Skor</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Mesaj</th>
                </tr>
              </thead>
              <tbody>
                {/* Result tek bir nesne olduğu için map kullanmıyoruz, doğrudan satırı yazıyoruz */}
                <tr>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.fileName}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.status}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>%{result.score}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{result.message}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            !loading && <p>Analiz sonuçları burada görünecek...</p>
          )}
        </div>
      </main>
    </div>
  )
} 

export default App;