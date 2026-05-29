import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css'; 

function Navbar({ title }) { 
  const navigate = useNavigate();
  
  const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  const role = localStorage.getItem('user_role') || sessionStorage.getItem('user_role');

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_role');
    navigate('/login');
  };

  const baseButtonStyle = {
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '0.5rem 1rem', 
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'background-color 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block'
  };

  return (
    <nav className="navbar-container" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0 3rem',   
      height: '60px', 
      backgroundColor: '#FFFFFF', 
      borderBottom: '1px solid #B0D9D9', 
      boxSizing: 'border-box',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
      position: 'relative' 
    }}>
      
      <div style={{ flex: 1, textAlign: 'left' }}>
        <Link 
          to="/" 
          className="navbar-logo" 
          style={{ 
            textDecoration: 'none', 
            color: '#4A6C6F', 
            fontWeight: '700', 
            fontSize: '1.8rem',
            whiteSpace: 'nowrap' 
          }}
        >
          ぽけっとほいく
        </Link>
      </div>

      <div style={{ flex: 1, textAlign: 'center' }}>
        {title && (
          <h1 className="navbar-title" style={{ 
            margin: 0, 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#4A6C6F',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </h1>
        )}
      </div>

      <div className="navbar-right" style={{ 
        flex: 1, 
        textAlign: 'right', 
        display: 'flex', 
        justifyContent: 'flex-end', 
        alignItems: 'center',
        gap: '0.5rem' 
      }}>
        {token ? (
          <>
            {role === 'parent' && (
              <Link
                to="/delete-account" 
                style={{ ...baseButtonStyle, backgroundColor: '#DC3545' }}
              >
                退会
              </Link>
            )}
            <button 
              onClick={handleLogout}
              style={{ ...baseButtonStyle, backgroundColor: '#87CEEB' }}
            >
              ログアウト
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ 
              marginRight: '1rem', 
              color: '#5F9EA0', 
              textDecoration: 'none', 
              fontSize: '1rem',
              whiteSpace: 'nowrap' 
            }}>
              ログイン
            </Link>
            <Link to="/" style={{ 
              color: '#5F9EA0', 
              textDecoration: 'none', 
              fontSize: '1rem',
              whiteSpace: 'nowrap' 
            }}>
              新規登録
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;