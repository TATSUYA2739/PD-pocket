import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import RegisterHost from './pages/RegisterHost.jsx'
import RegisterChoice from './pages/RegisterChoice.jsx'
import EventSearch from './pages/EventSearch.jsx'
import EventDetail from './pages/EventDetail.jsx'
import Calendar from './pages/Calendar.jsx'
import HostDashboard from './pages/HostDashboard.jsx'
import HostHistory from './pages/HostHistory.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DeleteAccount from './pages/DeleteAccount.jsx'
import Settings from './pages/Settings.jsx'
import MyReviews from './pages/MyReviews.jsx'
import HostProfile from './pages/HostProfile.jsx' 

import ParentLayout from './components/ParentLayout.jsx'
import AuthRoute from './components/AuthRoute.jsx'
import GuestRoute from './components/GuestRoute.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* --- ログイン不要なルート --- */}
        <Route element={<GuestRoute />}>
          <Route path="/" element={<RegisterChoice />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register_host" element={<RegisterHost />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* --- 保護者用ルート --- */}
        <Route element={<AuthRoute allowedRoles={['parent', 'admin']} />}>
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<Navigate to="/parent/calendar" replace />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="search" element={<EventSearch />} />
            <Route path="reviews" element={<MyReviews />} /> 
            <Route path="settings" element={<Settings />} /> 
          </Route>
          
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/host-profile/:hostId" element={<HostProfile />} /> {/* ← 追加 */}
          <Route path="/delete-account" element={<DeleteAccount />} />
          
          <Route path="/dashboard" element={<Navigate to="/parent/calendar" replace />} />
        </Route>

        {/* --- 主催者用ルート --- */}
        <Route element={<AuthRoute allowedRoles={['host', 'admin']} />}>
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/history" element={<HostHistory />} />
        </Route>

        {/* --- 管理者用ルート --- */}
        <Route element={<AuthRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)