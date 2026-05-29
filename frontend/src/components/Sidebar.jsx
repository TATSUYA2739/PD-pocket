import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../index.css';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('user_role');
      navigate('/login');
    }
  };

  return (
    <div className="sidebar" style={{
      width: '240px',
      backgroundColor: '#dfeaecff',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: '20px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      <div className="sidebar-logo" style={{ padding: '0 20px 30px', fontSize: '1.5rem', fontWeight: 'bold', color: '#2f8aaeff', textAlign: 'center' }}>
        ぽけっとほいく
      </div>
      
      <div className="sidebar-links" style={{ flexGrow: 1 }}>
        <NavLink to="/parent/calendar" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <span>📅</span> カレンダー
        </NavLink>
        <NavLink to="/parent/search" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <span>🔍</span> イベント検索
        </NavLink>
        
        <NavLink to="/parent/reviews" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <span>📝</span> レビュー
        </NavLink>

        <NavLink to="/parent/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} style={linkStyle}>
          <span>⚙️</span> 設定
        </NavLink>
      </div>

      <div className="sidebar-footer" style={{ padding: '20px', paddingBottom: '40px' }}>
        <button 
          onClick={handleLogout}
          style={{
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#fff', 
            color: '#29609bff', 
            border: '1px solid #29609bff', 
            borderRadius: '5px',
            cursor: 'pointer', 
            fontWeight: 'bold',
            display: 'flex',        
            alignItems: 'center',    
            justifyContent: 'center', 
            gap: '8px'              
          }}
        >
          <span>🚪</span> 
          ログアウト
        </button>
      </div>
    </div>
  );
}

const linkStyle = {
  padding: '12px 20px',
  textDecoration: 'none',
  color: '#29609bff',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  transition: 'all 0.2s',
  margin: '5px 0',
  borderRadius: '0 25px 25px 0'
};

export default Sidebar;