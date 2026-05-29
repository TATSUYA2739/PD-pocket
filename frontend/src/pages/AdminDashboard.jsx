import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';

function AdminDashboard() {
  const [pendingHosts, setPendingHosts] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

  const fetchPendingHosts = async () => {
    const token = getToken();
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    try {
      const response = await axios.get('/api/admin/pending_hosts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPendingHosts(response.data.hosts);
    } catch (err) {
      setError(err.response?.data?.msg || '承認待ちリストの読み込みに失敗しました');
    }
  };

  useEffect(() => {
    fetchPendingHosts();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    const token = getToken();
    if (!window.confirm(`この申請を「${newStatus === 'approved' ? '承認' : '拒否'}」しますか？`)) {
      return;
    }
    
    try {
      const response = await axios.post(
        '/api/admin/update_status', 
        { user_id: userId, new_status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(response.data.msg);
      fetchPendingHosts(); 
    } catch (err) {
      setError(err.response?.data?.msg || '処理に失敗しました');
    }
  };

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  
  const buttonStyle = (color) => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '0.5rem',
    color: 'white',
    backgroundColor: color === 'approve' ? '#28a745' : '#dc3545'
  });

  return (
    <div>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem' }}>
          運営ダッシュボード: 承認待ちリスト
        </h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        {pendingHosts.length > 0 ? (
          pendingHosts.map(host => (
            <div key={host.id} style={cardStyle}>
              <h3 style={{ marginTop: 0, color: '#005662' }}>{host.company_name}</h3>
              <p><strong>担当者:</strong> {host.contact_name}</p>
              <p><strong>Email:</strong> {host.email}</p>
              <p><strong>電話番号:</strong> {host.phone_number}</p>
              <p><strong>所在地:</strong> {host.address}</p>
              
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => handleUpdateStatus(host.id, 'approved')}
                  style={buttonStyle('approve')}
                >
                  承認する
                </button>
                <button 
                  onClick={() => handleUpdateStatus(host.id, 'rejected')}
                  style={buttonStyle('reject')}
                >
                  拒否する
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>現在、承認待ちの主催者はいません。</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;