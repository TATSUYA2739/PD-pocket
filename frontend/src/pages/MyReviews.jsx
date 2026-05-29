import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css';

function MyReviews() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeEventId, setActiveEventId] = useState(null); 
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

  const fetchMyEvents = async () => {
    const token = getToken();
    try {
      const response = await axios.get('/api/parent/my_events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(response.data.events);
    } catch (err) {
      setError('データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleReviewSubmit = async (eventId) => {
    if (rating === 0) {
      setSubmitMsg('評価（星）を選択してください');
      return;
    }
    const token = getToken();
    try {
      await axios.post(`/api/events/${eventId}/reviews`, {
        rating,
        comment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSubmitMsg('レビューを送信しました！');
      setTimeout(() => {
        setSubmitMsg('');
        setActiveEventId(null);
        setRating(0);
        setComment('');
        fetchMyEvents(); 
      }, 1500);
      
    } catch (err) {
      setSubmitMsg(err.response?.data?.msg || '送信に失敗しました');
    }
  };

  const openForm = (eventId) => {
    setActiveEventId(eventId);
    setRating(0);
    setComment('');
    setSubmitMsg('');
  };

  return (
    <div className="responsive-container">
      <h2 style={{ color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem' }}>参加イベント・レビュー</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading ? <p>読み込み中...</p> : (
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} style={{ 
                backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>
                  <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                    {event.title}
                  </Link>
                </h3>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
                  📅 {new Date(event.event_date).toLocaleString('ja-JP')} | 📍 {event.location}
                </p>

                {event.has_reviewed ? (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#27ae60' }}>✅ レビュー済み</p>
                    <div style={{ color: '#FFD700', fontSize: '1.2rem' }}>
                      {'★'.repeat(event.my_review.rating)}{'☆'.repeat(5 - event.my_review.rating)}
                    </div>
                    <p style={{ margin: '0.5rem 0' }}>{event.my_review.comment}</p>
                  </div>
                ) : (
                  <div>
                    {activeEventId === event.id ? (
                      <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #B0D9D9', borderRadius: '5px', backgroundColor: '#E0F2F7' }}>
                        <h4 style={{ marginTop: 0, color: '#005662' }}>レビューを書く</h4>
                        {submitMsg && <p style={{ fontWeight: 'bold', color: submitMsg.includes('失敗') ? 'red' : 'green' }}>{submitMsg}</p>}
                        
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ marginRight: '10px', fontWeight: 'bold' }}>評価:</span>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} onClick={() => setRating(star)} style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= rating ? '#FFD700' : '#ccc' }}>★</span>
                          ))}
                        </div>
                        <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="コメントを入力..."
                          style={{ width: '100%', height: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                        <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                          <button onClick={() => setActiveEventId(null)} style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ccc', border: 'none', borderRadius: '3px' }}>キャンセル</button>
                          <button onClick={() => handleReviewSubmit(event.id)} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#5F9EA0', color: 'white', border: 'none', borderRadius: '3px', fontWeight: 'bold' }}>送信</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => openForm(event.id)}
                        style={{ 
                          marginTop: '1rem', padding: '8px 16px', backgroundColor: '#5F9EA0', 
                          color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
                        }}
                      >
                        ✍️ レビューを書く
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>参加したイベントはまだありません。</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MyReviews;