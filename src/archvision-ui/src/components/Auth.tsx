import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ onLoginSuccess }: { onLoginSuccess: (data: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    const payload = isLogin ? { username, password } : { username, password, email };

    try {
      // DİKKAT: Backend adresin HTTP olduğundan emin ol!
      const response = await axios.post(`http://localhost:5018/api/auth/${endpoint}`, payload);
      
      if (isLogin) {
        // Giriş başarılıysa Token ve UserId'yi kaydet
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('username', response.data.username);
        onLoginSuccess(response.data);
        alert("Giriş başarılı! Hoş geldin " + response.data.username);
      } else {
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Bir hata oluştu!");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '12px', color: 'white' }}>
      <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          placeholder="Kullanıcı Adı" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={inputStyle} 
        />
        {!isLogin && (
          <input 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={inputStyle} 
          />
        )}
        <input 
          type="password" 
          placeholder="Şifre" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={inputStyle} 
        />
        <button type="submit" style={buttonStyle}>
          {isLogin ? 'Giriş' : 'Kayıt Ol'}
        </button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>
        {isLogin ? 'Hesabınız yok mu? Kayıt olun.' : 'Zaten hesabınız var mı? Giriş yapın.'}
      </p>
    </div>
  );
};

const inputStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#333', color: 'white' };
const buttonStyle = { padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export default Auth;