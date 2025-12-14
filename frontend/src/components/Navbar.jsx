import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .navbar-custom {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          backdrop-filter: blur(10px);
          border: none;
          box-shadow: none;
        }
        
        .nav-link-custom {
          position: relative;
          font-weight: 500;
          transition: all 0.3s ease;
          padding: 8px 16px !important;
          border-radius: 8px;
          cursor: pointer;
        }
        
        .nav-link-custom:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        
        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 80%;
          height: 2px;
          background: white;
          transition: transform 0.3s ease;
        }
        
        .nav-link-custom:hover::after {
          transform: translateX(-50%) scaleX(1);
        }
        
        .brand-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #E9D5FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          letter-spacing: -0.02em;
          font-size: 1.4rem;
        }
        
        .logout-btn {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #7C3AED;
          font-weight: 600;
          padding: 8px 24px;
          border-radius: 50px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .logout-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(147, 51, 234, 0.3);
          color: #6B21A8;
          border-color: white;
        }
        
        .navbar-toggler-custom {
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          padding: 6px 10px;
          transition: all 0.3s ease;
        }
        
        .navbar-toggler-custom:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: white;
        }
        
        .navbar-toggler-custom:focus {
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }
        
        .navbar-toggler-icon-custom {
          width: 24px;
          height: 2px;
          background: white;
          display: block;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .navbar-toggler-icon-custom::before,
        .navbar-toggler-icon-custom::after {
          content: '';
          width: 24px;
          height: 2px;
          background: white;
          position: absolute;
          left: 0;
          transition: all 0.3s ease;
        }
        
        .navbar-toggler-icon-custom::before {
          top: -7px;
        }
        
        .navbar-toggler-icon-custom::after {
          bottom: -7px;
        }
        
        @media (max-width: 991px) {
          .navbar-collapse-custom {
            background: rgba(124, 58, 237, 0.95);
            margin: 1rem -1rem -0.5rem;
            padding: 1.5rem 1rem;
            border-radius: 12px;
            margin-top: 1rem;
            box-shadow: 0 8px 24px rgba(107, 33, 168, 0.3);
          }
          
          .nav-link-custom {
            margin: 0.25rem 0;
          }
          
          .logout-btn {
            width: 100%;
            margin-top: 0.5rem;
          }
        }
      `}</style>
      
      <nav className="navbar navbar-expand-lg navbar-custom px-4" style={{ 
        background: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div className="container-fluid">
          <a 
            className="navbar-brand d-flex align-items-center" 
            href="/" 
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              boxShadow: "0 4px 12px rgba(168, 85, 247, 0.4)"
            }}>
              <i className="bi bi-graph-up-arrow" style={{ color: "white", fontSize: "1.2rem" }}></i>
            </div>
            <span className="brand-text">
              GPT SEO Tracker
            </span>
          </a>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler navbar-toggler-custom border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon-custom"></span>
          </button>

          {/* Collapsible Menu */}
          <div className="collapse navbar-collapse navbar-collapse-custom" id="navbarNav">
            <div className="navbar-nav ms-auto d-flex align-items-lg-center gap-2">
              <div 
                className="nav-link nav-link-custom" 
                onClick={() => navigate('/')}
                style={{ color: "white", fontSize: "0.95rem" }}
              >
                Home
              </div>
              <div 
                className="nav-link nav-link-custom" 
                onClick={() => navigate('/pricing')}
                style={{ color: "white", fontSize: "0.95rem" }}
              >
                Pricing
              </div>
              <div 
                className="nav-link nav-link-custom" 
                onClick={() => navigate('/about')}
                style={{ color: "white", fontSize: "0.95rem" }}
              >
                About Us
              </div>

              {/* {isLoggedIn && (
                <button className="logout-btn btn btn-sm" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              )} */}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;