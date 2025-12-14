import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const AdminSessionBanner = () => {
  const isAdminSession = localStorage.getItem('isAdminSession');
  const originalAdminEmail = localStorage.getItem('originalAdminEmail');
  const userEmail = localStorage.getItem('userEmail');

  if (!isAdminSession) {
    return null;
  }

  const handleBackToAdmin = () => {
    const originalAdminName = localStorage.getItem('originalAdminName');
    
    if (!confirm('Return to admin dashboard?')) {
      return;
    }

    // Restore admin credentials
    localStorage.setItem('adminEmail', originalAdminEmail);
    localStorage.setItem('adminName', originalAdminName);
    localStorage.setItem('isAdmin', 'true');
    
    // Remove user credentials
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('isAdminSession');
    localStorage.removeItem('originalAdminEmail');
    localStorage.removeItem('originalAdminName');
    
    // Redirect to admin dashboard
    window.location.href = '/admin/dashboard';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Shield size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '700',
              color: 'white',
              letterSpacing: '0.3px'
            }}>
              Admin Session Active
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.85)',
              marginTop: '2px'
            }}>
              Logged in as <strong>{userEmail}</strong> • Admin: {originalAdminEmail}
            </p>
          </div>
        </div>

        <button
          onClick={handleBackToAdmin}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'white',
            border: 'none',
            borderRadius: '8px',
            color: '#667eea',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminSessionBanner;