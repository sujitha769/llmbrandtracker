import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BarChart3, Settings, LogOut, Menu, X, DollarSign, Pencil, Save, Star } from "lucide-react";
import { apiFetch } from "../utils/api";

const AdminPricingManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('pricing');
  const navigate = useNavigate();

  const adminEmail = localStorage.getItem('adminEmail');
  const adminName = localStorage.getItem('adminName');

  // Default plans with FIXED names
  const [plans, setPlans] = useState([
    { name: "basic", title: "Starter", keywords: 100, price: 499, popular: false },
    { name: "pro", title: "Pro", keywords: 500, price: 1499, popular: true },
    { name: "business", title: "Business", keywords: 2000, price: 2999, popular: false },
  ]);
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin-login');
      return;
    }

    // Load plans from backend
    setIsLoading(true);
    apiFetch("/api/pricing")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
        // If fetch fails or returns empty, keep the initial default state
      })
      .catch(err => {
        console.error("Failed to load pricing:", err);
        // Keep the initial default state on error
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditForm({ ...plans[index] });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleSave = (index) => {
    const updatedPlans = [...plans];
    // Preserve the original plan name and title (FIXED)
    updatedPlans[index] = {
      ...editForm,
      name: plans[index].name,
      title: plans[index].title
    };
    
    setPlans(updatedPlans);
    
    apiFetch("/api/pricing", {
  method: "POST",
  body: JSON.stringify({ plans: updatedPlans })
})

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSaveStatus("✓ Saved successfully!");
          setTimeout(() => setSaveStatus(""), 3000);
        } else {
          setSaveStatus("✗ Failed to save");
        }
      })
      .catch(() => {
        setSaveStatus("✗ Server error");
        setPlans(plans);
      });

    setEditingIndex(null);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: field === 'keywords' || field === 'price' ? parseInt(value) || 0 : value
    }));
  };

  const togglePopular = (index) => {
    const updatedPlans = plans.map((plan, i) => ({
      ...plan,
      popular: i === index ? !plan.popular : false
    }));
    setPlans(updatedPlans);
    
    apiFetch("/api/pricing", {
  method: "POST",
  body: JSON.stringify({ plans: updatedPlans })
})

      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSaveStatus("✓ Popular badge updated!");
          setTimeout(() => setSaveStatus(""), 3000);
        } else {
          setSaveStatus("✗ Failed to update");
          setPlans(plans);
        }
      })
      .catch(() => {
        setSaveStatus("✗ Server error");
        setPlans(plans);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
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

          <nav style={{ flex: 1 }}>
            <button
              onClick={() => navigate('/admin/dashboard')}
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
                background: activeTab === 'pricing' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                border: activeTab === 'pricing' ? '1px solid rgba(102, 126, 234, 0.4)' : '1px solid transparent',
                borderRadius: '12px',
                color: activeTab === 'pricing' ? '#a5b4fc' : '#9ca3af',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.2s',
                textAlign: 'left'
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
                background: 'transparent',
                border: '1px solid transparent',
                borderRadius: '12px',
                color: '#9ca3af',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
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

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        marginLeft: sidebarOpen ? '280px' : '0',
        transition: 'margin-left 0.3s',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden'
      }}>
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
            {sidebarOpen ? <X size={20} color="#667eea" /> : <Menu size={20} />}
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
            Pricing Plans Manager
          </h1>
          {saveStatus && (
            <div style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: saveStatus.includes("✓") ? '#d1fae5' : '#fee2e2',
              color: saveStatus.includes("✓") ? '#065f46' : '#991b1b',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {saveStatus}
            </div>
          )}
        </div>

        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{ padding: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '20px 24px',
              borderRadius: '12px',
              marginBottom: '32px',
              color: 'white'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700' }}>
                📌 Manage Pricing Plans
              </h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                Edit keyword limits and prices. Plan names are fixed. Set which plan appears as "Most Popular".
              </p>
            </div>

            {isLoading && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                Loading pricing plans...
              </div>
            )}

            {!isLoading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {plans.map((plan, index) => (
                  <div
                    key={plan.name}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '28px',
                      border: plan.popular ? '2px solid #667eea' : '1px solid #e5e7eb',
                      position: 'relative',
                      boxShadow: plan.popular ? '0 10px 30px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '6px 20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '50px',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Star size={14} fill="white" />
                        MOST POPULAR
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px',
                      marginTop: plan.popular ? '12px' : '0'
                    }}>
                      <div>
                        <h2 style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: 0
                        }}>
                          {plan.title}
                        </h2>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '12px',
                          color: '#9ca3af',
                          fontWeight: '600'
                        }}>
                          Plan name is fixed
                        </p>
                      </div>
                      {editingIndex !== index && (
                        <button
                          onClick={() => handleEdit(index)}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                      )}
                    </div>

                    {editingIndex === index ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Keyword Limit
                          </label>
                          <input
                            type="number"
                            value={editForm.keywords}
                            onChange={(e) => handleInputChange('keywords', e.target.value)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '15px',
                              fontWeight: '500',
                              color: '#1f2937',
                              outline: 'none',
                              background: 'white',
                              transition: 'border 0.2s'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid #667eea'}
                            onBlur={(e) => e.target.style.border = '1px solid #e5e7eb'}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#374151',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            min="0"
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '15px',
                              fontWeight: '500',
                              color: '#1f2937',
                              outline: 'none',
                              background: 'white',
                              transition: 'border 0.2s'
                            }}
                            onFocus={(e) => e.target.style.border = '1px solid #667eea'}
                            onBlur={(e) => e.target.style.border = '1px solid #e5e7eb'}
                          />
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '8px'
                        }}>
                          <button
                            onClick={() => handleSave(index)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              fontSize: '15px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#059669';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#10b981';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <Save size={18} />
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancel}
                            style={{
                              flex: 1,
                              padding: '12px',
                              background: '#f3f4f6',
                              color: '#6b7280',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              fontSize: '15px',
                              fontWeight: '600',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e5e7eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f3f4f6';
                            }}
                          >
                            <X size={18} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          padding: '16px',
                          background: '#f9fafb',
                          borderRadius: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '600'
                            }}>
                              Keywords
                            </span>
                            <span style={{
                              fontSize: '14px',
                              color: '#1f2937',
                              fontWeight: '700'
                            }}>
                              {plan.keywords.toLocaleString()} / month
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{
                              fontSize: '14px',
                              color: '#6b7280',
                              fontWeight: '600'
                            }}>
                              Price
                            </span>
                            <span style={{
                              fontSize: '20px',
                              color: '#10b981',
                              fontWeight: '800'
                            }}>
                              ₹{plan.price.toLocaleString()}
                              <span style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                fontWeight: '500',
                                marginLeft: '4px'
                              }}>
                                /month
                              </span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => togglePopular(index)}
                          style={{
                            width: '100%',
                            padding: '12px',
                            background: plan.popular 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : '#f3f4f6',
                            color: plan.popular ? 'white' : '#6b7280',
                            border: plan.popular ? 'none' : '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            if (plan.popular) {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                            } else {
                              e.currentTarget.style.background = '#e5e7eb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (plan.popular) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            } else {
                              e.currentTarget.style.background = '#f3f4f6';
                            }
                          }}
                        >
                          <Star size={16} fill={plan.popular ? 'white' : 'none'} />
                          {plan.popular ? 'Currently Most Popular' : 'Set as Most Popular'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricingManager;