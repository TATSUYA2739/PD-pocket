import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import '../index.css'; 

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const getToken = () => localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');

  const fetchEventDetail = async () => {
    const token = getToken();
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    try {
      const response = await axios.get(`/api/events/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvent(response.data.event);
    } catch (err) {
      setError('イベントの読み込みに失敗しました');
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const handleRegisterToggle = async () => {
    const token = getToken();
    if (!token) return;

    setIsLoading(true);
    const apiUrl = event.is_registered ? `/api/events/${id}/cancel` : `/api/events/${id}/register`;

    try {
      await axios.post(apiUrl, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchEventDetail();
    } catch (err) {
      setError(err.response?.data?.msg || '処理に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setReviewMsg('評価（星）を選択してください');
      return;
    }
    const token = getToken();
    try {
      await axios.post(`/api/events/${id}/reviews`, {
        rating,
        comment
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReviewMsg('レビューを送信しました！ありがとうございます。');
      setRating(0);
      setComment('');
    } catch (err) {
      setReviewMsg(err.response?.data?.msg || 'レビュー送信に失敗しました');
    }
  };

  if (!event) {
    return (
      <div>
        <Navbar />
        {error ? <p style={{ color: 'red' }}>{error}</p> : <p>読み込み中...</p>}
      </div>
    );
  }

  const isFull = event.current_participants >= event.max_participants;

  return (
    <div>
      <Navbar />
      <div className="responsive-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', cursor: 'pointer' }}>← 戻る</button>
        
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, color: '#4A6C6F' }}>{event.title}</h2>
          
          {event.tags && event.tags.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              {event.tags.map((tag, i) => (
                <span key={i} style={{ 
                  display: 'inline-block', backgroundColor: '#E0F2F7', color: '#005662', 
                  padding: '4px 8px', borderRadius: '15px', fontSize: '0.85rem', marginRight: '5px' 
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p><strong>📅 日時:</strong> {new Date(event.event_date).toLocaleString('ja-JP')}</p>
          <p><strong>📍 場所:</strong> {event.location}</p>
          
          <div style={{ margin: '0.5rem 0' }}>
            <p style={{ margin: 0 }}><strong>🏢 主催:</strong> {event.company_name}</p>
            <Link 
              to={`/host-profile/${event.host_id}`} 
              style={{ fontSize: '0.9rem', color: '#5F9EA0', fontWeight: 'bold', marginLeft: '1.5rem' }}
            >
              👉 企業情報・過去の評価を見る
            </Link>
          </div>

          <p><strong>👥 定員:</strong> {event.current_participants} / {event.max_participants} 名</p>
          
          <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>詳細</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{event.description || '詳細情報はありません'}</p>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button 
            onClick={handleRegisterToggle} 
            disabled={isLoading || (!event.is_registered && isFull)}
            style={{ 
              width: '100%',
              padding: '1rem', 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              backgroundColor: event.is_registered ? '#e74c3c' : (isFull ? '#ccc' : '#27ae60'),
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: (isFull && !event.is_registered) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '処理中...' : 
             event.is_registered ? '参加をキャンセルする' : 
             isFull ? '満員 (参加不可)' : '参加登録する'}
          </button>
        </div>

        {event.is_registered && (
          <div style={{ marginTop: '2rem', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#4A6C6F' }}>イベントの評価・感想</h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>参加後の感想をぜひお聞かせください。</p>
            
            {reviewMsg && <p style={{ color: reviewMsg.includes('失敗') ? 'red' : 'green', fontWeight: 'bold' }}>{reviewMsg}</p>}

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>評価:</label>
                <div style={{ fontSize: '2rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => setRating(star)}
                      style={{ color: star <= rating ? '#FFD700' : '#ddd', marginRight: '5px' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>コメント:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="楽しかった点や改善点など..."
                />
              </div>

              <button 
                type="submit"
                style={{
                  padding: '10px 20px', backgroundColor: '#5F9EA0', color: 'white',
                  border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                評価を送信
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default EventDetail;