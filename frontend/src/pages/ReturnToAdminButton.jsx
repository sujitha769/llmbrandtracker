import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

// Add this component to your main dashboard/navbar
const ReturnToAdminButton = () => {
  const navigate = useNavigate();
  const isAdminSession = localStorage.getItem('isAdminSession');

  const handleReturnToAdmin = () => {
    // Restore admin credentials
    const adminEmail = localStorage.getItem('originalAdminEmail');
    const adminName = localStorage.getItem('originalAdminName');

    if (adminEmail) {
      localStorage.setItem('adminEmail', adminEmail);
      localStorage.setItem('adminName', adminName);
      localStorage.setItem('isAdmin', 'true');

      // Clear user session data
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPicture');
      localStorage.removeItem('originalAdminEmail');
      localStorage.removeItem('originalAdminName');
      localStorage.removeItem('isAdminSession');

      // Redirect to admin dashboard
      navigate('/admin-dashboard');
    }
  };

  // Only show if this is an admin session
  if (!isAdminSession) return null;

  return (
    <button
      onClick={handleReturnToAdmin}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.2s',
        zIndex: 1000
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
      }}
    >
      <ShieldCheck size={18} />
      Return to Admin Panel
    </button>
  );
};

export default ReturnToAdminButton;