import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      if (!token) return;
      try {
        const res = await axios.get('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile({ name: res.data.name, email: res.data.email });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const token = getToken();
      await axios.put('/api/user/profile', { name: profile.name }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'プロフィール情報を更新しました' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.msg || '更新に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMsg({ type: 'error', text: '新しいパスワードが一致しません' });
      return;
    }
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const token = getToken();
      await axios.post('/api/user/change-password', {
        current_password: passwords.current,
        new_password: passwords.new
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMsg({ type: 'success', text: 'パスワードを変更しました' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.msg || '変更に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const sectionStyle = {
    backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
    marginBottom: '2rem', border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' };
  const inputStyle = {
    width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '5px',
    border: '1px solid #ccc', boxSizing: 'border-box'
  };
  const readOnlyStyle = {
    ...inputStyle, backgroundColor: '#f5f5f5', color: '#666', border: 'none'
  };
  const buttonStyle = {
    padding: '10px 20px', backgroundColor: '#5F9EA0', color: 'white',
    border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
  };

  return (
    <div className="responsive-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
        アカウント設定
      </h2>

      {msg.text && (
        <div style={{
          padding: '1rem', marginBottom: '1rem', borderRadius: '5px',
          backgroundColor: msg.type === 'success' ? '#d4edda' : '#f8d7da',
          color: msg.type === 'success' ? '#155724' : '#721c24'
        }}>
          {msg.text}
        </div>
      )}

      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: '#4A6C6F' }}>プロフィール設定</h3>
        <form onSubmit={handleProfileUpdate}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              backgroundColor: '#eee', overflow: 'hidden', marginRight: '1.5rem',
              border: '2px solid #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem' }}>👤</span>
              )}
            </div>
            <label htmlFor="avatar-upload" style={{ ...buttonStyle, backgroundColor: '#fff', color: '#5F9EA0', border: '1px solid #5F9EA0', display: 'inline-block' }}>
              写真変更
            </label>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          <label style={labelStyle}>お名前 (ニックネーム)</label>
          <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} style={inputStyle} placeholder="お名前を入力" />

          <label style={labelStyle}>メールアドレス</label>
          <div style={readOnlyStyle}>{profile.email}</div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            ※メールアドレスの変更は運営までお問い合わせください
          </p>

          <div style={{ textAlign: 'right' }}>
            <button type="submit" disabled={isLoading} style={buttonStyle}>保存する</button>
          </div>
        </form>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ marginTop: 0, color: '#4A6C6F' }}>パスワードの変更</h3>
        <form onSubmit={handlePasswordChange}>
          <label style={labelStyle}>現在のパスワード</label>
          <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>新しいパスワード</label>
          <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} style={inputStyle} />
          <label style={labelStyle}>新しいパスワード (確認)</label>
          <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} style={inputStyle} />
          <div style={{ textAlign: 'right' }}>
            <button type="submit" disabled={isLoading} style={buttonStyle}>変更する</button>
          </div>
        </form>
      </div>

      <div style={{ ...sectionStyle, border: '1px solid #f5c6cb' }}>
        <h3 style={{ marginTop: 0, color: '#dc3545' }}>アカウントの削除</h3>
        <p style={{ color: '#555', fontSize: '0.9rem' }}>一度アカウントを削除すると、二度と元に戻すことはできません。</p>
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button onClick={() => navigate('/delete-account')} style={{ ...buttonStyle, backgroundColor: '#dc3545' }}>
            退会手続きへ進む
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;