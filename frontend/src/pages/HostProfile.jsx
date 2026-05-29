import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import '../index.css'; 

function HostProfile() {
  const { hostId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      if (!token) return;

      try {
        const response = await axios.get(`/api/public/host/${hostId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProfile(response.data.host);
        setReviews(response.data.reviews);
      } catch (err) {
        setError('企業情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [hostId]);

  if (loading) return <div><Navbar /> <p style={{padding:'2rem'}}>読み込み中...</p></div>;
  if (error) return <div><Navbar /> <p style={{padding:'2rem', color:'red'}}>{error}</p></div>;
  if (!profile) return <div><Navbar /> <p style={{padding:'2rem'}}>情報が見つかりません</p></div>;

  return (
    <div>
      <Navbar />
      <div className="responsive-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← 戻る</button>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginTop: 0, color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem' }}>
            {profile.company_name}
          </h2>
          <p><strong>担当者:</strong> {profile.contact_name}</p>
          <p><strong>住所:</strong> {profile.address}</p>
          <p><strong>電話番号:</strong> {profile.phone_number}</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#4A6C6F' }}>過去のイベント評価・コメント ({reviews.length}件)</h3>
          
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>
                      イベント: {review.event_title}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{review.created_at}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#FFD700', fontSize: '1.1rem' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>By {review.user_name}</span>
                  </div>
                  <p style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#888' }}>まだレビューはありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostProfile;