import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const TAG_OPTIONS = [
  "音楽", "スポーツ", "英語", "屋外", "屋内", 
  "食育", "アート", "科学", "ダンス", "プログラミング",
  "0歳向け", "1-2歳向け", "3-5歳向け", "小学生向け", "親子参加"
];

function HostDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [selectedTags, setSelectedTags] = useState([]);
  const [msg, setMsg] = useState('');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
    
    try {
      await axios.post('/api/events', {
        title,
        description,
        event_date: eventDate, 
        location,
        max_participants: parseInt(maxParticipants, 10),
        tags: selectedTags
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMsg('イベントを登録しました');
      setTitle('');
      setDescription('');
      setEventDate('');
      setLocation('');
      setMaxParticipants(20);
      setSelectedTags([]);
    } catch (err) {
      setMsg(err.response?.data?.msg || '登録に失敗しました');
    }
  };

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <Navbar title="主催者ダッシュボード" />
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',            
          marginBottom: '2rem', 
          borderBottom: '2px solid #B0D9D9', 
          paddingBottom: '1rem' 
        }}>
          <h2 style={{ margin: 0, color: '#4A6C6F' }}>管理メニュー</h2>
          
          <Link to="/host/history" style={{ 
            textDecoration: 'none', 
            backgroundColor: '#5F9EA0', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            fontWeight: 'bold',
            textAlign: 'center', 
            display: 'inline-block',
            alignSelf: 'flex-start'
          }}>
            📋 登録イベント履歴を見る
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>新規イベント登録</h3>
          {msg && <p style={{ color: msg.includes('失敗') ? 'red' : 'green' }}>{msg}</p>}
          
          <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>イベント名:</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>開催日時:</label>
              <input 
                type="datetime-local" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                required 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>参加可能人数:</label>
              <input 
                type="number" 
                value={maxParticipants} 
                onChange={(e) => setMaxParticipants(e.target.value)} 
                min="1"
                required 
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>場所:</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="例: 市民センター会議室"
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>詳細:</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                style={{ width: '100%', height: '100px', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>タグ (複数選択可):</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '15px',
                      border: selectedTags.includes(tag) ? '2px solid #5F9EA0' : '1px solid #ddd',
                      backgroundColor: selectedTags.includes(tag) ? '#E0F2F7' : '#fff',
                      color: selectedTags.includes(tag) ? '#005662' : '#555',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              style={{ 
                padding: '12px', 
                backgroundColor: '#27ae60', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                marginTop: '1rem',
                fontSize: '1rem'
              }}
            >
              イベントを登録する
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;