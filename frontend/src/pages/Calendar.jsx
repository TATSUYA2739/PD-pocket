import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css'; 

function Calendar() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
      try {
        const response = await axios.get('/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEvents(response.data.events);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay(); 
  const lastDate = new Date(year, month + 1, 0).getDate(); 
  
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} style={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}></div>);
  }
  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const dayEvents = events.filter(e => 
      e.event_date.startsWith(dateStr) && e.is_registered
    );

    const isToday = 
      today.getFullYear() === year && 
      today.getMonth() === month && 
      today.getDate() === d;

    calendarCells.push(
      <div key={d} className="calendar-cell" style={{ 
        border: '1px solid #ddd', 
        height: 'auto',
        padding: '5px', 
        backgroundColor: isToday ? '#fffde7' : 'white', 
        position: 'relative',
        overflow: 'hidden' 
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '2px',
          color: isToday ? '#f57f17' : 'inherit', 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '0.9rem' 
        }}>
          <span>{d}</span>
          {isToday && <span style={{ fontSize: '0.6rem', color: '#f57f17' }}>今日</span>}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {dayEvents.map(e => (
            <Link key={e.id} to={`/event/${e.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                fontSize: '0.7rem', 
                backgroundColor: '#87CEEB', 
                color: 'white', 
                padding: '1px 3px', 
                borderRadius: '3px', 
                whiteSpace: 'nowrap', 
                overflow: 'hidden',   
                textOverflow: 'ellipsis' 
              }}>
                {e.title}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container-sm" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexWrap: 'nowrap' 
      }}>
        <h2 style={{ margin: 0, color: '#4A6C6F', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
          {year}年 {month + 1}月
        </h2>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={prevMonth} style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>&lt; 前月</button>
          <button onClick={() => setCurrentDate(new Date())} style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>今日</button>
          <button onClick={nextMonth} style={{ padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>次月 &gt;</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0', backgroundColor: '#ddd', border: '1px solid #ddd' }}>
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div key={day} style={{ 
            padding: '5px',
            textAlign: 'center', 
            backgroundColor: '#f0f0f0', 
            fontWeight: 'bold', 
            fontSize: '0.9rem', 
            color: index === 0 ? '#e74c3c' : index === 6 ? '#3498db' : '#555', 
            borderRight: '1px solid #ddd' 
          }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0', backgroundColor: '#ddd', borderTop: 'none' }}>
        {calendarCells}
      </div>
    </div>
  );
}

export default Calendar;