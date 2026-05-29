import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [rememberMe, setRememberMe] = useState(true); 

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); 

    try {
      const response = await axios.post('/api/login', { email, password });
      const { access_token, role } = response.data;

      if (rememberMe) {
        localStorage.setItem('jwt_token', access_token);
        localStorage.setItem('user_role', role);
      } else {
        sessionStorage.setItem('jwt_token', access_token);
        sessionStorage.setItem('user_role', role);
      }
      
      if (role === 'host') {
        navigate('/host/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/parent/calendar');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'ログインに失敗しました');
      setIsLoading(false); 
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Navbar title="ログイン" />
      <div style={{
        backgroundColor: '#E0F2F7',
        minHeight: 'calc(100vh - 60px)', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start', 
        paddingTop: '50px',        
        overflowY: 'auto', 
        boxSizing: 'border-box',
        paddingBottom: '50px' 
      }}>
        <div style={{ 
          padding: '2rem', 
          maxWidth: '500px', 
          width: '90%', 
          backgroundColor: 'white', 
          borderRadius: '10px', 
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          boxSizing: 'border-box',
          minHeight: '580px',              
          display: 'flex',                 
          flexDirection: 'column'          
        }}>
          
          <div style={{ flexGrow: 1 }}> 
            <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>ログイン</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
              
              <div style={{ textAlign: 'left' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#555' }}>Email:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '5px', 
                    border: '1px solid #B0D9D9', fontSize: '1rem', boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ textAlign: 'left', position: 'relative' }}>
                <label style={{ display: 'block', marginBottom: '0.3rem', color: '#555' }}>Password:</label>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', padding: '12px', borderRadius: '5px', 
                    border: '1px solid #B0D9D9', fontSize: '1rem', boxSizing: 'border-box'
                  }}
                />
                <span 
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute', right: '12px', top: '40px', 
                    cursor: 'pointer', color: '#5F9EA0', userSelect: 'none'    
                  }}
                >
                  {showPassword ? '非表示' : '表示'}
                </span>
              </div>
              
              <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="rememberMe" style={{ color: '#555', userSelect: 'none' }}>
                  ログイン状態を保持する
                </label>
              </div>

              <button 
                type="submit" disabled={isLoading} 
                style={{ 
                  width: '100%', padding: '12px 20px', backgroundColor: '#87CEEB',
                  color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', 
                  transition: 'background-color 0.3s ease', opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          </div>
          <div style={{ 
            marginTop: '1.5rem',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.8rem' 
          }}>
            <p style={{ margin: 0 }}>
              <Link to="/forgot-password" style={{ color: '#5F9EA0', textDecoration: 'none', fontSize: '0.95rem' }}>
                パスワードを忘れましたか？
              </Link>
            </p>
            
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0, marginTop: '0.5rem' }}>
              アカウントをお持ちでないですか？{' '}
              <Link to="/" style={{ color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' }}>
                新規登録
              </Link>
            </p>
          </div>

        </div> 
        
      </div> 
    </>
  );
}

export default LoginPage;