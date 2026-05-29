import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../index.css';

function ParentLayout() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className="main-content" style={{ 
        flexGrow: 1, 
        marginLeft: '240px',
        backgroundColor: '#f4f7f6', 
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </div>
    </div>
  );
}

export default ParentLayout;