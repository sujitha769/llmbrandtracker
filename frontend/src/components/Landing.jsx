import React, { useState, useEffect } from "react";
import analysissetupImg from "../assets/images/analysissetup.png";
import detailedImg from "../assets/images/detailed.png";
import historyImg from "../assets/images/history.png";
import mailImg from "../assets/images/mail.png";
import graphImg from "../assets/images/graph.png"; 
const Landing = ({ onGoogleLogin }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      image: analysissetupImg,
      title: "Easy Analysis Setup",
      description: "Configure your SEO tracking in minutes with our intuitive setup wizard. Connect Google Search Console and customize your tracking preferences effortlessly."
    },
    {
      image: detailedImg,
      title: "Detailed Results Dashboard",
      description: "Get comprehensive insights with detailed analytics, keyword rankings, click-through rates, and AI-powered recommendations to boost your SEO performance."
    },
    {
      image: historyImg,
      title: "Complete Analysis History",
      description: "Track your SEO progress over time with historical data visualization. Compare performance across different periods and identify trends instantly."
    },
    {
      image: mailImg,
      title: "Automated Email Reports",
      description: "Receive scheduled email reports with key metrics and insights. Stay informed about your SEO performance without logging in daily."
    },
     {
    image: graphImg,  // Add this new feature
    title: "Visual Performance Graphs",  // Choose an appropriate title
    description: "Visualize your SEO metrics with interactive charts and graphs. Spot trends and patterns at a glance with beautiful data visualization."  // Choose an appropriate description
  }
  ];

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentFeature((prev) => {
      const next = (prev + 1) % 5; // Explicitly use 5 instead of features.length
      console.log('Moving to feature:', next); // Debug log
      return next;
    });
  }, 3000);
  return () => clearInterval(interval);
}, []); // Empty array is fine since we hardcoded 5

  return (
    <div style={{ minHeight: "100vh", width: "100vw", overflowX: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .gradient-text {
          background: linear-gradient(135deg, #9333EA 0%, #C084FC 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(147, 51, 234, 0.1);
        }
        
        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(147, 51, 234, 0.2);
          border-color: rgba(147, 51, 234, 0.3);
        }
        
        .cta-button {
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(147, 51, 234, 0.4);
        }
      `}</style>

      {/* Hero Section with Gradient */}
      <div className="container-fluid" style={{
        paddingTop: "140px",
        paddingBottom: "80px", 
        background: "linear-gradient(135deg, #6B21A8 0%, #7C3AED 50%, #8B5CF6 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "rgba(167, 139, 250, 0.1)",
          top: "-200px",
          right: "-150px",
          filter: "blur(80px)"
        }}></div>
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(196, 181, 253, 0.1)",
          bottom: "-150px",
          left: "-100px",
          filter: "blur(80px)"
        }}></div>
        
        <div className="container text-center text-white" style={{ position: "relative", zIndex: 1 }}>
          <h1 className="fw-bold mb-3" style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "-0.02em",
            fontWeight: "800",
          
          }}>
            GPT SEO Tracker
          </h1>
          <p className="mb-4" style={{ 
            maxWidth: "800px", 
            margin: "0 auto 2rem",
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
            fontWeight: "400",
            lineHeight: "1.6",
            opacity: "0.95"
          }}>
            Track your brand's visibility and keyword performance using Google Search Console data + AI insights
          </p>
          <button 
            className="btn btn-light btn-lg px-5 py-3 cta-button" 
            onClick={onGoogleLogin}
            style={{ 
              borderRadius: "50px", 
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "none",
                backgroundColor: "#FFFFFF",
              color: "#7C3AED"
            }}
          >
            <i className="bi bi-google me-2"></i> Sign in with Google
          </button>
        </div>
      </div>

      {/* Features Showcase with Light Violet Background */}
      <div className="container-fluid py-5" style={{ background: "linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)" }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-5 gradient-text" style={{ 
            fontSize: "clamp(2rem, 4vw, 2.8rem)",
            fontWeight: "800",
            letterSpacing: "-0.01em"
          }}>
             Features
          </h2>
          
          <div className="row align-items-center">
            {/* Image Carousel */}
            <div className="col-lg-7 mb-4 mb-lg-0">
              <div className="position-relative" style={{ height: "500px", width: "100%" }}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="position-absolute"
                    style={{
                      opacity: currentFeature === index ? 1 : 0,
                      transition: "opacity 0.6s ease-in-out",
                      height: "100%",
                      width: "100%",
                      top: 0,
                      left: 0,
                      borderRadius: "20px",
                      overflow: "hidden",
                      boxShadow: currentFeature === index ? "0 20px 60px rgba(109, 40, 217, 0.25)" : "none"
                    }}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      style={{
                        objectFit: "contain",
                        height: "100%",
                        width: "100%",
                        borderRadius: "20px",
                        border: "1px solid rgba(147, 51, 234, 0.1)"
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Indicator Dots */}
              <div className="d-flex justify-content-center mt-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentFeature(index)}
                    className="btn btn-sm rounded-circle mx-1"
                    style={{
                      width: "12px",
                      height: "12px",
                      padding: 0,
                      backgroundColor: currentFeature === index ? "#9333EA" : "#DDD6FE",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Feature Description */}
            <div className="col-lg-5">
              <div style={{ minHeight: "200px" }}>
                <h3 className="fw-bold mb-4 gradient-text" style={{ 
                  fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                  fontWeight: "700",
                  letterSpacing: "-0.01em"
                }}>
                  {features[currentFeature].title}
                </h3>
                <p style={{ 
                  color: "#6B21A8", 
                  fontSize: "1.15rem",
                  lineHeight: "1.7",
                  fontWeight: "400"
                }}>
                  {features[currentFeature].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards with White Background */}
      <div className="container py-5" style={{ background: "#FFFFFF" }}>
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-center p-4 feature-card" style={{ 
              background: "linear-gradient(135deg, #FDFBFF 0%, #FAF5FF 100%)",
              borderRadius: "16px"
            }}>
              <div className="mb-3">
                <div style={{
                  width: "70px",
                  height: "70px",
                  margin: "0 auto",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #9333EA 0%, #A855F7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="bi bi-gear-fill" style={{ fontSize: "2rem", color: "white" }}></i>
                </div>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#6B21A8", fontSize: "1.2rem", fontWeight: "700" }}>Easy Setup</h5>
              <p style={{ color: "#7C3AED", fontSize: "0.95rem", fontWeight: "400" }}>Quick and simple configuration process</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-center p-4 feature-card" style={{ 
              background: "linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%)",
              borderRadius: "16px"
            }}>
              <div className="mb-3">
                <div style={{
                  width: "70px",
                  height: "70px",
                  margin: "0 auto",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="bi bi-envelope-fill" style={{ fontSize: "2rem", color: "white" }}></i>
                </div>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#7C3AED", fontSize: "1.2rem", fontWeight: "700" }}>Email Reports</h5>
              <p style={{ color: "#8B5CF6", fontSize: "0.95rem", fontWeight: "400" }}>Automated scheduled email notifications</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-center p-4 feature-card" style={{ 
              background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
              borderRadius: "16px"
            }}>
              <div className="mb-3">
                <div style={{
                  width: "70px",
                  height: "70px",
                  margin: "0 auto",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="bi bi-bar-chart-fill" style={{ fontSize: "2rem", color: "white" }}></i>
                </div>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#6B21A8", fontSize: "1.2rem", fontWeight: "700" }}>Detailed Analytics</h5>
              <p style={{ color: "#7C3AED", fontSize: "0.95rem", fontWeight: "400" }}>Comprehensive SEO performance metrics</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card h-100 border-0 text-center p-4 feature-card" style={{ 
              background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
              borderRadius: "16px"
            }}>
              <div className="mb-3">
                <div style={{
                  width: "70px",
                  height: "70px",
                  margin: "0 auto",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <i className="bi bi-clock-history" style={{ fontSize: "2rem", color: "white" }}></i>
                </div>
              </div>
              <h5 className="fw-bold mb-2" style={{ color: "#7C3AED", fontSize: "1.2rem", fontWeight: "700" }}>History Tracking</h5>
              <p style={{ color: "#8B5CF6", fontSize: "0.95rem", fontWeight: "400" }}>Monitor progress with historical data</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Different Gradient */}
      <div className="container-fluid py-5 mt-5" style={{ 
        background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(196, 181, 253, 0.15)",
          top: "-100px",
          left: "-100px",
          filter: "blur(60px)"
        }}></div>
        <div style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(233, 213, 255, 0.15)",
          bottom: "-80px",
          right: "-80px",
          filter: "blur(60px)"
        }}></div>
        
        <div className="container text-center text-white" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="fw-bold mb-4" style={{ 
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: "800",
            letterSpacing: "-0.01em"
          }}>Ready to Boost Your SEO?</h2>
          <p className="mb-5" style={{ 
            fontSize: "1.2rem",
            fontWeight: "400",
            opacity: "0.95",
            maxWidth: "600px",
            margin: "0 auto 2rem"
          }}>Start tracking your website's performance today with AI-powered insights</p>
          <button 
            className="btn btn-light btn-lg px-5 py-3 cta-button" 
            onClick={onGoogleLogin}
            style={{ 
              borderRadius: "50px", 
              fontSize: "1.1rem",
              fontWeight: "600",
              border: "none",
              backgroundColor: "#FFFFFF",
              color: "#7C3AED"
            }}
          >
            <i className="bi bi-google me-2"></i> Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;