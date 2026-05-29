import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx'; 

function RegisterPage() { 
  const [step, setStep] = useState(1); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const [verificationCode, setVerificationCode] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    
    setIsLoading(true); 

    try {
      const response = await axios.post('/api/register', { email, password }); 
      setMessage(response.data.msg); 
      setStep(2); 

    } catch (err) {
      setError(err.response?.data?.msg || '新規登録に失敗しました');
    } finally {
      setIsLoading(false); 
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/verify_registration', { 
        email: email,
        code: verificationCode 
      }); 
      
      setMessage(response.data.msg);
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000); 

    } catch (err) {
      setError(err.response?.data?.msg || '認証に失敗しました');
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
  const eyeIconStyle = {
    position: 'absolute', right: '12px', top: '40px', 
    cursor: 'pointer', color: '#5F9EA0', userSelect: 'none'    
  };


  return (
    <>
      <Navbar title="参加者用 新規登録" />
      <div style={{
        backgroundColor: '#E0F2F7', minHeight: 'calc(100vh - 60px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-start', paddingTop: '50px',        
        overflowY: 'auto', boxSizing: 'border-box', paddingBottom: '50px' 
      }}>
        <div style={{ 
          padding: '2rem', maxWidth: '500px', width: '90%', 
          backgroundColor: 'white', borderRadius: '10px', 
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          textAlign: 'center', boxSizing: 'border-box',
          minHeight: '580px', display: 'flex', flexDirection: 'column'          
        }}>
          
          <div style={{ flexGrow: 1 }}> 
            
            {step === 1 && (
              <>
                <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>新規登録</h2>
                <form onSubmit={handleSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                  
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                  </div>
                  
                  <div style={{ textAlign: 'left', position: 'relative' }}>
                    <label style={labelStyle}>Password:</label>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
                    <span onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>
                      {showPassword ? '非表示' : '表示'}
                    </span>
                  </div>

                  <div style={{ textAlign: 'left', position: 'relative' }}>
                    <label style={labelStyle}>Confirm Password:</label>
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeIconStyle}>
                      {showConfirmPassword ? '非表示' : '表示'}
                    </span>
                  </div>

                  <button type="submit" disabled={isLoading} style={buttonStyle}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                    onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
                  >
                    {isLoading ? 'コード送信中...' : '認証コードを送信'}
                  </button>
                </form>
              </>
            )}
            
            {step === 2 && (
              <>
                <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>認証コード入力</h2>
                {message && <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>}
                {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                
                <p style={{ color: '#555', fontSize: '0.95rem' }}>
                  <strong>{email}</strong> 宛に送信された6桁の認証コードを入力してください。
                  (開発モード: ターミナルの表示を確認してください)
                </p>

                <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>認証コード:</label>
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value)} 
                      required 
                      maxLength={6}
                      style={inputStyle} 
                    />
                  </div>
                  
                  <button type="submit" disabled={isLoading} style={buttonStyle}
                    onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#64B5F6')}
                    onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#87CEEB')}
                  >
                    {isLoading ? '認証中...' : '認証して登録完了'}
                  </button>
                </form>

                <button 
                  onClick={() => { setStep(1); setError(''); setMessage(''); }}
                  style={{...buttonStyle, backgroundColor: '#aaa', marginTop: '0.5rem'}}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#888')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#aaa')}
                >
                  メールアドレスを修正
                </button>
              </>
            )}

          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0}}>
              アカウントを既にお持ちですか？{' '}
              <Link to="/login" style={{ color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' }}>
                ログイン
              </Link>
            </p>
          </div>

        </div> 
      </div> 
    </>
  );
}

export default RegisterPage;