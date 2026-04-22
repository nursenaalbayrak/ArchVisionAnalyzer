import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'

interface AnalysisResponse {
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
 const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5018";

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
      alert("Analiz sırasında bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

      const fetchHistory = async () => {
      try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/analysis/history/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setHistory(data);
        setView('history'); 
    } catch (error) {
        alert("Geçmiş yüklenirken hata oluştu!");
    }
  };

    const fetchStats = async () => {
  try {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    
    const response = await fetch(`${API_URL}/api/Analysis/user-stats/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("İstatistikler alınamadı");

    const data = await response.json();
    setStats(data); 
    setView('stats'); 
  } catch (error) {
    console.error(error);
    alert("İstatistikler yüklenirken bir hata oluştu!");
  }

};
  
  
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }


  
  return (
  <div className="app-layout">
   
    <aside className="sidebar">
      <div className="sidebar-logo">ArchVision AI</div>
      
      <nav className="nav-menu">
       
        <div 
          className={`nav-item ${view === 'analyze' ? 'active' : ''}`} 
          onClick={() => setView('analyze')}
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
        <div style={{fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px'}}>
          Kullanıcı: <strong>{user.username}</strong>
        </div>
        <button className="logout-btn-style" onClick={handleLogout}>Çıkış Yap</button>
      </div>
    </aside>

    <main className="main-content">
      <header className="main-header">
        <h2 style={{margin: 0, fontSize: '1.2rem'}}>
          {view === 'analyze' ? 'Kod Analiz Merkezi' : 'Analiz Geçmişi'}
        </h2>
        <div style={{color: '#94a3b8', fontSize: '0.9rem'}}>༼ つ ◕_◕ ༽つ</div>
      </header>

      <div className="main-container">
  {/* 1. ANALİZ EKRANI */}
  {view === 'analyze' && (
    <div className="analysis-grid">
       {/* Mevcut analiz kodların */}
    </div>
  )}

  {/* 2. GEÇMİŞ EKRANI */}
  {view === 'history' && (
    <div className="history-container">
       {/* Mevcut geçmiş kartların */}
    </div>
  )}

  {/* 3. İSTATİSTİK EKRANI (İşte burası!) */}
  {view === 'stats' && stats && (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Toplam Analiz</h4>
        <div className="stat-value">{stats.total}</div>
      </div>
      <div className="stat-card">
        <h4>Ort. Benzerlik</h4>
        <div className="stat-value">%{stats.averageScore}</div>
      </div>
      <div className="stat-card">
        <h4>Kopya Sayısı</h4>
        <div className="stat-value" style={{color: '#ef4444'}}>{stats.cloneCount}</div>
      </div>
      <div className="stat-card">
        <h4>Özgün Kod</h4>
        <div className="stat-value" style={{color: '#22c55e'}}>{stats.originalCount}</div>
      </div>
    </div>
  )}
</div>
    </main>
  </div>
);
} 

export default App