import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css'; 

const PREDEFINED_TAGS = [
  "音楽", "スポーツ", "英語", "屋外", "屋内", 
  "食育", "アート", "科学", "ダンス", "プログラミング",
  "0歳向け", "1-2歳向け", "3-5歳向け", "小学生向け", "親子参加"
];

function EventSearch() { 
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedTags, setSelectedTags] = useState([]); 
  
  const [isTagOpen, setIsTagOpen] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      
      if (!token) {
        setError('ログインが必要です');
        return;
      }
      try {
        const response = await axios.get('/api/events', { 
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEvents(response.data.events);
      } catch (err) {
        setError('イベントの読み込みに失敗しました');
      }
    };
    fetchEvents();
  }, []);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const eventTags = event.tags || []; 
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => eventTags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const tagButtonStyle = (isSelected) => ({
    padding: '6px 12px',
    borderRadius: '15px',
    border: isSelected ? '2px solid #5F9EA0' : '1px solid #ddd',
    backgroundColor: isSelected ? '#E0F2F7' : '#fff',
    color: isSelected ? '#005662' : '#555',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: isSelected ? 'bold' : 'normal',
    transition: 'all 0.2s',
    marginRight: '8px',
    marginBottom: '8px'
  });

  return (
    <div className="responsive-container-sm">
      <h2 style={{ color: '#4A6C6F', borderBottom: '2px solid #B0D9D9', paddingBottom: '0.5rem', marginTop: 0 }}>
        イベント検索
      </h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ margin: '1.5rem 0', padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="イベント名や場所で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', fontSize: '1rem', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div>
          <div 
            onClick={() => setIsTagOpen(!isTagOpen)} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              marginBottom: isTagOpen ? '1rem' : '0' 
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
              タグで絞り込む
              {selectedTags.length > 0 && <span style={{ color: '#5F9EA0', marginLeft: '10px' }}>({selectedTags.length}個選択中)</span>}
            </p>
            <span style={{ fontSize: '1.2rem', color: '#5F9EA0' }}>
              {isTagOpen ? '▲' : '▼'}
            </span>
          </div>

          {isTagOpen && (
            <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease-in-out' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {PREDEFINED_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={tagButtonStyle(selectedTags.includes(tag))}
                  >
                    {tag} {selectedTags.includes(tag) && '✓'}
                  </button>
                ))}
              </div>
              
              {selectedTags.length > 0 && (
                <button 
                  onClick={() => setSelectedTags([])}
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#d9534f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  条件をクリア
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} style={{ 
              border: '1px solid #e0e0e0', padding: '1.5rem', borderRadius: '8px',
              backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ marginTop: 0, color: '#333' }}>{event.title}</h3>
              <p style={{ margin: '0.5rem 0' }}><strong>📅 日時:</strong> {new Date(event.event_date).toLocaleString('ja-JP')}</p>
              <p style={{ margin: '0.5rem 0' }}><strong>📍 場所:</strong> {event.location}</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>主催: {event.company_name}</p>
              
              {event.tags && event.tags.length > 0 && (
                <div style={{ margin: '0.5rem 0', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {event.tags.map((tag, index) => (
                    <span key={index} style={{ fontSize: '0.75rem', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', color: '#555' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {event.is_registered && <span style={{color: 'green', fontWeight: 'bold', fontSize: '0.9em', display: 'block', margin: '0.5rem 0'}}>✅ 参加予定</span>}

              <Link to={`/event/${event.id}`} style={{ 
                display: 'inline-block', marginTop: '1rem', color: '#5F9EA0', fontWeight: 'bold', width: '100%' 
              }}>
                詳細を見る →
              </Link>
            </div>
          ))
        ) : (
          <p>条件に一致するイベントは見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
}

export default EventSearch;