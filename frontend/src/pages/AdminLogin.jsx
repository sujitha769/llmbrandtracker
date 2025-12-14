import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success) {
        localStorage.setItem('adminEmail', email);
        localStorage.setItem('adminName', data.admin.name);
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      margin: 0,
      overflow: 'auto'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '500px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Lock size={40} style={{ color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Admin Portal
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Authorized access only
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: '1px solid #ced4da',
                    background: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#000'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  pointerEvents: 'none'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: '1px solid #ced4da',
                    background: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    color: '#000'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              🔒 This is a protected area. Only authorized administrators can access this portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
