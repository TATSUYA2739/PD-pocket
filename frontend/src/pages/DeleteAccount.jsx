import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function DeleteAccount() {
  const [step, setStep] = useState(1); 
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const token = getToken();
      await axios.post('/api/request-deletion-code', 
        { password },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage('認証コードを発行しました。ターミナルを確認してください。');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'リクエストに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('本当にアカウントを削除しますか？この操作は元に戻せません。')) {
      return;
    }
    
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const token = getToken();
      const response = await axios.post('/api/delete-account', 
        { code },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessage(response.data.msg); 
      
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('user_role');
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || '削除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = { 
    width: '100%', padding: '12px', borderRadius: '5px', 
    border: '1px solid #B0D9D9', fontSize: '1rem', boxSizing: 'border-box'
  };
  const labelStyle = { display: 'block', marginBottom: '0.3rem', color: '#555' };
  const buttonStyle = {
    width: '100%', padding: '12px 20px', 
    color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem',
    cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', 
    transition: 'background-color 0.3s ease', opacity: isLoading ? 0.7 : 1
  };

  return (
    <>
      <Navbar title="アカウントの退会" />
      <div style={{
        backgroundColor: '#E0F2F7', minHeight: 'calc(100vh - 60px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', paddingTop: '50px',
        overflowY: 'scroll', boxSizing: 'border-box', paddingBottom: '50px'
      }}>
        <div style={{
          padding: '2rem', maxWidth: '500px', width: '90%',
          backgroundColor: 'white', borderRadius: '10px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center', marginBottom: '50px',
          minHeight: '450px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ color: '#DC3545', marginBottom: '1.5rem' }}>
              {step === 1 ? 'アカウントの退会' : '最終確認'}
            </h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {step === 1 && (
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  退会手続きに進むには、現在のパスワードを入力して本人確認を行ってください。
                </p>
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>現在のパスワード:</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={isLoading} 
                  style={{...buttonStyle, backgroundColor: '#87CEEB'}}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
                >
                  {isLoading ? '確認中...' : '認証コードをリクエスト'}
                </button>
              </form>
            )}

            {step === 2 && !message.includes("削除されました") && (
              <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p style={{ color: '#555', fontSize: '0.95rem' }}>
                  ターミナルに表示された6桁の認証コードを入力し、[アカウントを削除] ボタンを押してください。
                  <br />
                  <strong style={{color: '#DC3545'}}>この操作は取り消せません。</strong>
                </p>
                
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>認証コード (6桁):</label>
                  <input
                    type="text" value={code} onChange={(e) => setCode(e.target.value)}
                    required maxLength={6} style={inputStyle}
                  />
                </div>
                
                <button type="submit" disabled={isLoading} 
                  style={{...buttonStyle, backgroundColor: '#DC3545'}} 
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#C82333')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#DC3545')}
                >
                  {isLoading ? '削除中...' : 'アカウントを削除する'}
                </button>
              </form>
            )}
            
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: '#555', fontSize: '0.95rem' }}>
              <Link to="/parent/calendar" style={{ color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' }}>
                ダッシュボードに戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteAccount;