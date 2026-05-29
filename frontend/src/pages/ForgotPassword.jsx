import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import Navbar from '../components/Navbar.jsx';

function ForgotPassword() {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await axios.post('/api/forgot-password', { email });
      setMessage('認証コードを送信しました。ターミナルを確認してください。');
      setStep(2); 
    } catch (err) {
      setError(err.response?.data?.msg || 'リクエストに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('新しいパスワードが一致しません');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await axios.post('/api/reset-password', { 
        email, 
        code, 
        password 
      });
      
      setMessage(response.data.msg);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.msg || 'リセットに失敗しました');
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
    width: '100%', padding: '12px 20px', backgroundColor: '#87CEEB', 
    color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem',
    cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem', 
    transition: 'background-color 0.3s ease', opacity: isLoading ? 0.7 : 1
  };


  return (
    <>
      <Navbar title="パスワード再設定" />
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
          minHeight: '550px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>
              {step === 1 ? 'パスワードをお忘れですか？' : 'パスワードの再設定'}
            </h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  登録したメールアドレスを入力してください。認証コードを発行します。
                </p>
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>Email:</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={isLoading} style={buttonStyle}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
                >
                  {isLoading ? '送信中...' : '認証コードを送信'}
                </button>
              </form>
            )}

            {step === 2 && !message.includes("成功") && ( 
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p style={{ color: '#555', fontSize: '0.95rem' }}>
                  <strong>{email}</strong> 宛の認証コード（ターミナル表示）と、新しいパスワードを入力してください。
                </p>
                
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>認証コード (6桁):</label>
                  <input
                    type="text" value={code} onChange={(e) => setCode(e.target.value)}
                    required maxLength={6} style={inputStyle}
                  />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>新しいパスワード:</label>
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    required style={inputStyle}
                  />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>新しいパスワード (確認):</label>
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    required style={inputStyle}
                  />
                </div>
                <button type="submit" disabled={isLoading} style={buttonStyle}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
                >
                  {isLoading ? '更新中...' : 'パスワードを更新'}
                </button>
              </form>
            )}
            
          </div>

          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: '#555', fontSize: '0.95rem' }}>
              <Link to="/login" style={{ color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' }}>
                ログインページに戻る
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;