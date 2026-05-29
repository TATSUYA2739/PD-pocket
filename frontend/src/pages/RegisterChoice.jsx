import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function RegisterChoice() {
  return (
    <>
      <Navbar title="新規登録" />
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
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          <h2 style={{ color: '#4A6C6F', marginBottom: '2.5rem' }}>アカウントの種別を選択</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button 
                style={{
                  width: '100%', padding: '15px 20px', backgroundColor: '#87CEEB',
                  color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem',
                  cursor: 'pointer', transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#64B5F6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#87CEEB'}
              >
                👤 参加者として登録
              </button>
            </Link>

            <Link to="/register_host" style={{ textDecoration: 'none' }}>
              <button 
                style={{
                  width: '100%', padding: '15px 20px', backgroundColor: '#6c757d',
                  color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem',
                  cursor: 'pointer', transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                🏢 主催者として登録
              </button>
            </Link>
          </div>

          <div style={{ marginTop: '3rem' }}>
            <p style={{ color: '#555', fontSize: '0.95rem', margin: 0 }}>
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

export default RegisterChoice;