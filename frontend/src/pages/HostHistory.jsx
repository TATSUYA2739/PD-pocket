import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';

function HostHistory() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

  const fetchHostEvents = async () => {
    const token = getToken();
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    try {
      const response = await axios.get('/api/host/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(response.data.events);
    } catch (err) {
      setError('イベント履歴の読み込みに失敗しました');
    }
  };

  useEffect(() => {
    fetchHostEvents();
  }, []);

  const toggleReviews = async (eventId) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
      setReviews([]);
      return;
    }

    setSelectedEventId(eventId);
    setIsLoadingReviews(true);
    const token = getToken();
    try {
      const response = await axios.get(`/api/events/${eventId}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReviews(response.data.reviews);
    } catch (err) {
      console.error('レビュー取得エラー', err);
      alert('レビューの取得に失敗しました');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('このイベントを削除してもよろしいですか？')) {
      return;
    }
    const token = getToken();
    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchHostEvents();
    } catch (err) {
      setError(err.response?.data?.msg || '削除に失敗しました');
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <Navbar title="イベント履歴・評価確認" />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem' }}>登録イベント一覧</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} style={{ border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ marginTop: 0, color: '#333' }}>{event.title}</h3>
                    <p style={{ margin: '0.5rem 0' }}><strong>日時:</strong> {new Date(event.event_date).toLocaleString('ja-JP')}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>場所:</strong> {event.location}</p>
                    <p style={{ margin: '0.5rem 0' }}><strong>参加者:</strong> {event.current_participants} / {event.max_participants} 名</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                      onClick={() => toggleReviews(event.id)}
                      style={{ 
                        backgroundColor: '#5F9EA0', color: 'white', border: 'none', 
                        padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' 
                      }}
                    >
                      {selectedEventId === event.id ? '評価を閉じる' : '評価・コメントを見る'}
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', cursor: 'pointer' }}
                    >
                      削除
                    </button>
                  </div>
                </div>

                {selectedEventId === event.id && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h4 style={{ marginTop: 0, color: '#555' }}>📝 参加者からのレビュー</h4>
                    {isLoadingReviews ? (
                      <p>読み込み中...</p>
                    ) : reviews.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {reviews.map((review) => (
                          <li key={review.id} style={{ borderBottom: '1px solid #ddd', padding: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 'bold' }}>{review.user_name} さん</span>
                              <span style={{ color: '#888', fontSize: '0.9rem' }}>{review.created_at}</span>
                            </div>
                            <div style={{ color: '#FFD700', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                            <p style={{ margin: 0, color: '#333' }}>{review.comment}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ color: '#888' }}>まだレビューはありません。</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>登録したイベントはありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostHistory;