import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Settings, LogOut, Menu, X, LogIn,DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(null);
  const navigate = useNavigate();

  const adminEmail = localStorage.getItem('adminEmail');
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin-login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/stats?email=${adminEmail}`);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch users
      const usersRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/users?email=${adminEmail}`);
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAsUser = async (userEmail) => {
    if (!confirm(`Are you sure you want to login as ${userEmail}?`)) {
      return;
    }

    setSigningIn(userEmail);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/admin/login-as-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: adminEmail,
          userEmail: userEmail
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store the original admin credentials
        localStorage.setItem('originalAdminEmail', adminEmail);
        localStorage.setItem('originalAdminName', adminName);
        localStorage.setItem('isAdminSession', 'true');

        // Set user credentials
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userPicture', data.user.picture || '');
        
        // Remove admin credentials temporarily
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminName');
        localStorage.removeItem('isAdmin');

        // Redirect to main app
        alert(`Successfully logged in as ${userEmail}. You can return to admin panel anytime.`);
       window.location.href = "/dashboard";

      } else {
        alert(data.message || 'Failed to login as user');
      }
    } catch (error) {
      console.error('Error logging in as user:', error);
      alert('Failed to login as user. Please try again.');
    } finally {
      setSigningIn(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#f3f4f6', overflow: 'hidden' }}>
      {/* Sidebar - Fixed */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
        transition: 'width 0.3s',
        overflow: 'hidden',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 20
      }}>
        <div style={{ 
          padding: '24px', 
          minWidth: '280px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Logo/Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white' }}>
                Admin Panel
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                {adminName || 'Administrator'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1 }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: activeTab === 'users' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                border: activeTab === 'users' ? '1px solid rgba(102, 126, 234, 0.4)' : '1px solid transparent',
                borderRadius: '12px',
                color: activeTab === 'users' ? '#a5b4fc' : '#9ca3af',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'users') {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'users') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <Users size={20} />
              All Users
            </button>


            <button
  onClick={() => navigate('/admin/pricing')}
  style={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '12px',
    color: '#9ca3af',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '8px',
    transition: 'all 0.2s',
    textAlign: 'left'
  }}
  onMouseEnter={(e) => {
    e.target.style.background = 'rgba(255,255,255,0.05)';
  }}
  onMouseLeave={(e) => {
    e.target.style.background = 'transparent';
  }}
>
  <DollarSign size={20} />
  Pricing Plans
</button>

            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: activeTab === 'analytics' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                border: activeTab === 'analytics' ? '1px solid rgba(102, 126, 234, 0.4)' : '1px solid transparent',
                borderRadius: '12px',
                color: activeTab === 'analytics' ? '#a5b4fc' : '#9ca3af',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'analytics') {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'analytics') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <BarChart3 size={20} />
              Analytics
              <span style={{
                marginLeft: 'auto',
                background: '#374151',
                color: '#9ca3af',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Soon
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: activeTab === 'settings' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                border: activeTab === 'settings' ? '1px solid rgba(102, 126, 234, 0.4)' : '1px solid transparent',
                borderRadius: '12px',
                color: activeTab === 'settings' ? '#a5b4fc' : '#9ca3af',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'settings') {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'settings') {
                  e.target.style.background = 'transparent';
                }
              }}
            >
              <Settings size={20} />
              Settings
              <span style={{
                marginLeft: 'auto',
                background: '#374151',
                color: '#9ca3af',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Soon
              </span>
            </button>
          </nav>

          {/* Logout Button */}
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#fca5a5',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Bar - Fixed */}
        <div style={{
          background: 'white',
          padding: '20px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            {activeTab === 'users' ? 'All Users' : activeTab === 'analytics' ? 'Analytics' : 'Settings'}
          </h1>
        </div>

        {/* Content Area - Scrollable */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{ padding: '32px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  margin: '0 auto 16px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: '#6b7280' }}>Loading data...</p>
              </div>
            ) : activeTab === 'users' ? (
              <>
                {/* Stats Cards */}
                {stats && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '20px',
                    marginBottom: '32px'
                  }}>
                    <div style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Total Users
                      </p>
                      <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#1f2937' }}>
                        {stats.totalUsers}
                      </p>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Active Subscriptions
                      </p>
                      <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                        {stats.activeSubscriptions}
                      </p>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Free Users
                      </p>
                      <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#6b7280' }}>
                        {stats.freeUsers}
                      </p>
                    </div>
                    <div style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>
                        Admins
                      </p>
                      <p style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#8B5CF6' }}>
                        {stats.adminCount}
                      </p>
                    </div>
                  </div>
                )}

                {/* Users Table */}
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Email
                          </th>
                          <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Name
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Role
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Plan
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Keywords Used
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Price
                          </th>
                           <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Change Plan
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Plan End
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Status
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Joined
                          </th>
                          <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase' }}>
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, idx) => (
                          <tr key={user._id} style={{
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                              {user.email}
                            </td>
                            <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                              {user.name || 'N/A'}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: user.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                                color: user.role === 'admin' ? '#92400e' : '#3730a3'
                              }}>
                                {user.role}
                              </span>
                            </td>
                           <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>
                              {user.plan?.name || 'None'}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                              {user.plan?.usedKeywords || 0} / {user.plan?.maxKeywords || 0}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                              ₹{user.plan?.price || 0}
                            </td>


                              <td style={{ padding: '16px', textAlign: 'center' }}>
  <button
    onClick={() => navigate(`/admin/user/${user._id}/edit-plan`)}
    style={{
      padding: '8px 14px',
      background: '#3b82f6',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer'
    }}
  >
    Change Plan
  </button>
</td>

                            
                            <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                              {formatDate(user.planEnd)}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                color: user.status === 'Active' ? '#065f46' : '#991b1b'
                              }}>
                                {user.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                              {formatDate(user.createdAt)}
                            </td>
                            <td style={{ padding: '16px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleLoginAsUser(user.email)}
                                disabled={signingIn === user.email}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 16px',
                                  background: signingIn === user.email ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: 'white',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: signingIn === user.email ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s',
                                  opacity: signingIn === user.email ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (signingIn !== user.email) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (signingIn !== user.email) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                <LogIn size={16} />
                                {signingIn === user.email ? 'Signing in...' : 'Sign In'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                background: 'white',
                padding: '60px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '18px', color: '#6b7280', fontWeight: '600' }}>
                  Coming Soon
                </p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  This feature is under development
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;