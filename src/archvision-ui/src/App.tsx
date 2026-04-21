import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth' // Auth bileşenini oluşturduğunu varsayıyoruz

interface AnalysisResponse {
  status: string;
  score: number;
  message: string;
  createdAt: string;
}

function App() {
  // 1. Auth & Kullanıcı State'leri
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  
  // 2. Analiz State'leri
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Sayfa yüklendiğinde daha önce giriş yapılmış mı kontrol et
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    if (token && username && userId) {
      setUser({ userId, username });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!code1.trim() || !code2.trim()) {
      alert("Lütfen karşılaştırmak için iki kod bloğunu da doldurun!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5018/api/analysis/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Token'ı header'a ekliyoruz
        },
        body: JSON.stringify({ 
          code1, 
          code2,
          userId: user?.userId // Analizi yapan kullanıcıyı bildiriyoruz
        })
      });

      if (!response.ok) throw new Error("Bağlantı hatası!");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analiz sırasında bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  // --- EĞER KULLANICI GİRİŞ YAPMAMIŞSA ---
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }


  // --- ANA ARAYÜZ ---
  return (
  <div className="app-layout">
    {/* --- SIDEBAR --- */}
    <aside className="sidebar">
      <div className="sidebar-logo">
        ArchVision AI
      </div>
      
      <nav className="nav-menu">
        <div className="nav-item active">
          <span>🔍</span> Yeni Analiz
        </div>
        <div className="nav-item" onClick={() => alert("Geçmiş analizler yakında!")}>
          <span>📜</span> Geçmiş Analizler
        </div>
        <div className="nav-item">
          <span>📊</span> İstatistikler
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px'}}>
          Kullanıcı: <strong>{user.username}</strong>
        </div>
        <button 
          onClick={handleLogout}
          style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer'}}
        >
          Çıkış Yap
        </button>
      </div>
    </aside>

    {/* --- ANA İÇERİK --- */}
    <main className="main-content">
      <header style={{padding: '20px 40px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between'}}>
        <h2 style={{margin: 0, fontSize: '1.2rem'}}>Kod Analiz Merkezi</h2>
        <div style={{color: '#94a3b8', fontSize: '0.9rem'}}>v1.0.4 - Celal Bayar University</div>
      </header>

      <div className="main-container">
        <div className="analysis-grid">
          <div className="code-card">
            <h3>Source Code</h3>
            <textarea 
              value={code1} 
              onChange={(e) => setCode1(e.target.value)} 
              placeholder="Kaynak kodu buraya yapıştırın..."
            />
          </div>

          <div className="code-card">
            <h3>Target Code</h3>
            <textarea 
              value={code2} 
              onChange={(e) => setCode2(e.target.value)} 
              placeholder="Karşılaştırılacak kodu buraya yapıştırın..."
            />
          </div>

          <button 
            className="analyze-btn" 
            onClick={handleAnalyze} 
            disabled={loading}
          >
            {loading ? 'AI Engine İşliyor...' : 'Derin Analizi Başlat'}
          </button>

          {result && (
            <div className="result-section">
              <h2 style={{margin: 0, color: '#38bdf8'}}>Analiz Tamamlandı</h2>
              <div style={{fontSize: '48px', fontWeight: '800', margin: '20px 0'}}>
                 %{result.score}
              </div>
              <p style={{fontSize: '1.1rem', color: '#f1f5f9'}}>{result.message}</p>
              <div style={{
                display: 'inline-block', 
                padding: '8px 20px', 
                borderRadius: '20px', 
                fontWeight: 'bold',
                background: result.score > 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: result.score > 70 ? '#ef4444' : '#22c55e',
                border: result.score > 70 ? '1px solid #ef4444' : '1px solid #22c55e'
              }}>
                Durum: {result.status}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);
}

export default App