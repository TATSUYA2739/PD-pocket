import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function RegisterHostPage() {
  const [step, setStep] = useState(1); 

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const [verificationCode, setVerificationCode] = useState('');

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    setIsLoading(true); 
    
    try {
      const postData = { ...formData };
      delete postData.confirmPassword;
      
      const response = await axios.post('/api/register_host', postData);
      
      setMessage(response.data.msg); 
      setStep(2); 
      
    } catch (err) {
      setError(err.response?.data?.msg || '登録申請に失敗しました');
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
        email: formData.email, 
        code: verificationCode 
      }); 
     
      setMessage(response.data.msg); 
      setStep(3); 

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
      <Navbar title="主催者用 新規登録" />
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
          boxSizing: 'border-box', display: 'flex',
          flexDirection: 'column', justifyContent: 'space-between' 
        }}>
          
          <div>
            {step === 1 && (
              <>
                <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>主催者情報登録</h2>
                <form onSubmit={handleSubmitDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
                  
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>企業名:</label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>担当者名:</label>
                    <input type="text" name="contact_name" value={formData.contact_name} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>担当者メールアドレス:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>電話番号:</label>
                    <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>所在地:</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} />
                  </div>
                  <div style={{ textAlign: 'left', position: 'relative' }}>
                    <label style={labelStyle}>Password:</label>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
                    <span onClick={() => setShowPassword(!showPassword)} style={eyeIconStyle}>{showPassword ? '非表示' : '表示'}</span>
                  </div>
                  <div style={{ textAlign: 'left', position: 'relative' }}>
                    <label style={labelStyle}>Confirm Password:</label>
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required style={inputStyle} />
                    <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeIconStyle}>{showConfirmPassword ? '非表示' : '表示'}</span>
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
                  <strong>{formData.email}</strong> 宛に送信された6桁の認証コードを入力してください。
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
                    {isLoading ? '認証中...' : '認証して申請完了'}
                  </button>
                </form>

                <button 
                  onClick={() => { setStep(1); setError(''); setMessage(''); }}
                  style={{...buttonStyle, backgroundColor: '#aaa', marginTop: '0.5rem'}}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.backgroundColor = '#888')}
                  onMouseLeave={e => !isLoading && (e.currentTarget.style.backgroundColor = '#aaa')}
                >
                  入力情報を修正
                </button>
              </>
            )}

            {step === 3 && (
              <div style={{ padding: '2rem', backgroundColor: '#f0f9f0', borderRadius: '5px' }}>
                <h2 style={{ color: '#4A6C6F', marginBottom: '1.5rem' }}>申請完了</h2>
                <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>
                <p style={{ color: '#555', marginTop: '1rem' }}>
                  運営が確認後、ログイン可能になります。
                </p>
                <Link 
                  to="/login" 
                  style={{ 
                    display: 'inline-block', marginTop: '1.5rem',
                    color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' 
                  }}
                >
                  ログインページへ
                </Link>
              </div>
            )}

          </div>
          
          {step === 1 && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: '#555', fontSize: '0.95rem' }}>
                アカウントを既にお持ちですか？{' '}
                <Link to="/login" style={{ color: '#5F9EA0', textDecoration: 'none', fontWeight: 'bold' }}>
                  ログイン
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default RegisterHostPage;