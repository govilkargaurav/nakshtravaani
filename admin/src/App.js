import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Horoscopes from './pages/Horoscopes';
import HoroscopeReader from './pages/HoroscopeReader';
import { isAuthenticated } from './utils/auth';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#722ed1',
          borderRadius: 6,
        },
      }}
    >
      <AntdApp>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/horoscopes"
          element={
            <ProtectedRoute>
              <Layout>
                <Horoscopes />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/horoscope-reader"
          element={
            <ProtectedRoute>
              <Layout>
                <HoroscopeReader />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;