import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'

interface AnalysisResponse {
  id?: number;
  status: string;
  score: number;
  message: string;
  createdAt: string;
}

function App() {
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null); 
  const [code1, setCode1] = useState("");
  const [code2, setCode2] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<'analyze' | 'history' | 'stats'>('analyze');
  const [history, setHistory] = useState<AnalysisResponse[]>([]);
  const [stats, setStats] = useState<any>(null); 

  const API_URL = import.meta.env.VITE_API_URL || "https://archvision-api.onrender.com";

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
    setView('analyze');
  };

  const handleAnalyze = async () => {
    if (!code1.trim() || !code2.trim()) {
      alert("Lütfen karşılaştırmak için iki kod bloğunu da doldurun!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analysis/upload`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          code1, 
          code2,
          userId: user?.userId 
        })
      });

      if (!response.ok) throw new Error("Bağlantı hatası!");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Analiz sırasında bir hata oluştu (Python servisi canlıda olmadığı için simüle ediliyor olabilir)!");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setView('history');
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analysis/history/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    setView('stats');
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analysis/user-stats/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("İstatistikler alınamadı");
      const data = await response.json();
      setStats(data); 
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR (YAN MENÜ) */}
      <aside className="sidebar">
        <div className="sidebar-logo">ArchVision AI</div>
        
        <nav className="nav-menu">
          <div 
            className={`nav-item ${view === 'analyze' ? 'active' : ''}`} 
            onClick={() => { setView('analyze'); setResult(null); }}
          >
            <span>🔍</span> Yeni Analiz
          </div>

          <div 
            className={`nav-item ${view === 'history' ? 'active' : ''}`} 
            onClick={fetchHistory}
          >
            <span>📜</span> Analiz Geçmişiniz
          </div>

          <div 
            className={`nav-item ${view === 'stats' ? 'active' : ''}`} 
            onClick={fetchStats} 
          >
            <span>📊</span> İstatistikler
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-text">
            Kullanıcı: <strong>{user.username}</strong>
          </div>
          <button className="logout-btn-style" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <main className="main-content">
        <header className="main-header">
          <h2 style={{margin: 0, fontSize: '1.2rem'}}>
            {view === 'analyze' && '🔍 Kod Analiz Merkezi'}
            {view === 'history' && '📜 Analiz Geçmişi'}
            {view === 'stats' && '📊 Kullanıcı İstatistikleri'}
          </h2>
          <div style={{color: '#94a3b8', fontSize: '0.9rem'}}>༼ つ ◕_◕ ༽つ</div>
        </header>

        <div className="main-container">
          {/* 1. ANALİZ EKRANI */}
          {view === 'analyze' && (
            <div className="analysis-grid">
              <div className="input-card">
                <h4>Kaynak Kod (Kod 1)</h4>
                <textarea 
                  className="code-textarea"
                  value={code1}
                  onChange={(e) => setCode1(e.target.value)}
                  placeholder="Birinci kod bloğunu buraya yapıştırın..."
                />
              </div>
              
              <div className="input-card">
                <h4>Karşılaştırılacak Kod (Kod 2)</h4>
                <textarea 
                  className="code-textarea"
                  value={code2}
                  onChange={(e) => setCode2(e.target.value)}
                  placeholder="İkinci kod bloğunu buraya yapıştırın..."
                />
              </div>

              <div className="action-area">
                <button 
                  className="analyze-btn" 
                  onClick={handleAnalyze} 
                  disabled={loading}
                >
                  {loading ? 'Analiz Ediliyor...' : 'Analizi Başlat 🚀'}
                </button>
              </div>

              {result && (
                <div className={`result-card ${result.score > 50 ? 'warning' : 'success'}`}>
                  <h3>Analiz Sonucu: %{result.score} Benzerlik</h3>
                  <p>{result.message}</p>
                  <small>Tarih: {new Date(result.createdAt).toLocaleString()}</small>
                </div>
              )}
            </div>
          )}

          {/* 2. GEÇMİŞ EKRANI */}
          {view === 'history' && (
            <div className="history-container">
              {history.length === 0 ? (
                <p className="no-data-msg">Henüz bir analiz geçmişiniz bulunmuyor.</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="history-card">
                    <div className="card-header">
                      <strong>Analiz #{item.id || history.length - index}</strong>
                      <span className="date">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="card-body">
                      <p>Benzerlik Skoru: <span className="score">%{item.score}</span></p>
                      <p>Durum: <strong>{item.status}</strong></p>
                      <p className="message">{item.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. İSTATİSTİK EKRANI */}
          {view === 'stats' && stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Toplam Analiz</h4>
                <div className="stat-value">{stats.totalCount || 0}</div>
              </div>
              <div className="stat-card">
                <h4>Ort. Benzerlik</h4>
                <div className="stat-value">%{stats.averageScore?.toFixed(1) || 0}</div>
              </div>
              <div className="stat-card">
                <h4>Kopya Sayısı</h4>
                <div className="stat-value" style={{color: '#ef4444'}}>{stats.cloneCount || 0}</div>
              </div>
              <div className="stat-card">
                <h4>Özgün Kod</h4>
                <div className="stat-value" style={{color: '#22c55e'}}>{stats.originalCount || 0}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;