import React, { useState } from 'react';

const CompetitorAnalysis = ({ data, brand, competitors = [] }) => {
  const [sortBy, setSortBy] = useState('shareOfVoice');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Convert competitors string to array
  const competitorList = typeof competitors === 'string' 
    ? competitors.split(',').map(c => c.trim()).filter(Boolean)
    : Array.isArray(competitors) ? competitors : [];

  // Aggregate competitor data from all questions
  const aggregateCompetitors = () => {
    const competitorMap = new Map();

    data.forEach(keyword => {
      keyword.questions.forEach(question => {
        // Handle both allBrands and gptBrands
        const brandsList = question.allBrands || question.gptBrands || [];
        
        if (brandsList && Array.isArray(brandsList)) {
          brandsList.forEach((brandName, index) => {
            const position = index + 1;
            
            if (!competitorMap.has(brandName)) {
              competitorMap.set(brandName, {
                name: brandName,
                mentions: 0,
                totalPosition: 0,
                bestPosition: Infinity,
                appearances: 0,
                keywords: new Set(),
                isYourBrand: brandName.toLowerCase().includes(brand?.toLowerCase() || ''),
                isCompetitor: competitorList.some(c => 
                  brandName.toLowerCase().includes(c.toLowerCase())
                )
              });
            }

            const comp = competitorMap.get(brandName);
            comp.mentions++;
            comp.appearances++;
            comp.totalPosition += position;
            comp.bestPosition = Math.min(comp.bestPosition, position);
            comp.keywords.add(keyword.keyword);
          });
        }
      });
    });

    // Calculate metrics
    const totalQuestions = data.reduce((sum, kw) => sum + kw.questions.length, 0);
    
    const competitorArray = Array.from(competitorMap.values()).map(comp => ({
      ...comp,
      shareOfVoice: ((comp.mentions / totalQuestions) * 100).toFixed(2),
      avgPosition: (comp.totalPosition / comp.appearances).toFixed(1),
      keywordCoverage: `${comp.keywords.size}/${data.length}`,
      links: comp.mentions
    }));

    return competitorArray;
  };

  const competitorData = aggregateCompetitors();

  // Filter competitors based on search query
  const filteredCompetitors = competitorData.filter(comp =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort competitors
  const sortedCompetitors = [...filteredCompetitors].sort((a, b) => {
    let aVal, bVal;
    
    switch(sortBy) {
      case 'shareOfVoice':
        aVal = parseFloat(a.shareOfVoice);
        bVal = parseFloat(b.shareOfVoice);
        break;
      case 'avgPosition':
        aVal = parseFloat(a.avgPosition);
        bVal = parseFloat(b.avgPosition);
        break;
      case 'mentions':
        aVal = a.mentions;
        bVal = b.mentions;
        break;
      default:
        aVal = parseFloat(a.shareOfVoice);
        bVal = parseFloat(b.shareOfVoice);
    }

    if (sortOrder === 'asc') {
      return aVal - bVal;
    }
    return bVal - aVal;
  });

  // Show top 10 or all based on toggle
  const displayedCompetitors = showAll ? sortedCompetitors : sortedCompetitors.slice(0, 10);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getShareOfVoiceColor = (percentage) => {
    const num = parseFloat(percentage);
    if (num >= 10) return '#10b981';
    if (num >= 5) return '#3b82f6';
    if (num >= 2) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ 
      padding: '40px', 
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginTop: 32,
      marginBottom: 48
    }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: 800, 
          color: '#111827',
          marginBottom: 8
        }}>
          🏆 Competitor Landscape
        </h2>
        <p style={{ 
          color: '#6b7280', 
          fontSize: 15,
          marginBottom: 0
        }}>
See who's winning AI recommendations and understand what it takes to rank alongside them
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{ 
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 40px 10px 12px',
              fontSize: 14,
              border: 'none',
              borderBottom: '1px solid #d1d5db',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
              background: 'transparent',
              color: '#111827'
            }}
            onFocus={(e) => e.target.style.borderBottomColor = '#111827'}
            onBlur={(e) => e.target.style.borderBottomColor = '#d1d5db'}
          />
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#111827" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              right: 12,
              pointerEvents: 'none'
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>
        
        {sortedCompetitors.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '2px solid #4f46e5',
              background: showAll ? '#4f46e5' : 'white',
              color: showAll ? 'white' : '#4f46e5',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {showAll ? '✕ Show Less' : `👁 View All (${sortedCompetitors.length})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ 
        overflowX: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: 12
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14
        }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'left',
                fontWeight: 700,
                color: '#374151',
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Rank
              </th>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'left',
                fontWeight: 700,
                color: '#374151',
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Name
              </th>
              <th 
                onClick={() => handleSort('shareOfVoice')}
                style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Share of Voice {sortBy === 'shareOfVoice' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('avgPosition')}
                style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Avg Position {sortBy === 'avgPosition' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                onClick={() => handleSort('mentions')}
                style={{ 
                  padding: '16px 20px', 
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#374151',
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Mentions {sortBy === 'mentions' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ 
                padding: '16px 20px', 
                textAlign: 'center',
                fontWeight: 700,
                color: '#374151',
                fontSize: 13,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Keywords
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedCompetitors.length === 0 ? (
              <tr>
                <td colSpan="6" style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: 15
                }}>
                  No competitors found matching "{searchQuery}"
                </td>
              </tr>
            ) : (
              displayedCompetitors.map((comp, index) => {
                // Calculate actual rank in full sorted list
                const actualRank = sortedCompetitors.indexOf(comp) + 1;
                
                return (
                  <tr 
                    key={index}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      background: comp.isYourBrand ? '#eef2ff' : 'white',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!comp.isYourBrand) e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (!comp.isYourBrand) e.currentTarget.style.background = 'white';
                    }}
                  >
                    <td style={{ 
                      padding: '16px 20px',
                      color: '#6b7280',
                      fontWeight: 600
                    }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: actualRank <= 3 ? '#fef3c7' : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        color: actualRank <= 3 ? '#92400e' : '#6b7280',
                        fontSize: 14
                      }}>
                        {actualRank}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px 20px',
                      fontWeight: 600,
                      color: '#111827'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: comp.isYourBrand ? '#4f46e5' : '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: comp.isYourBrand ? 'white' : '#6b7280',
                          fontSize: 16
                        }}>
                          {comp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            {comp.name}
                          </div>
                          {comp.isYourBrand && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#4f46e5',
                              color: 'white',
                              display: 'inline-block',
                              marginTop: 4
                            }}>
                              YOUR BRAND
                            </span>
                          )}
                          {comp.isCompetitor && !comp.isYourBrand && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: '#f97316',
                              color: 'white',
                              display: 'inline-block',
                              marginTop: 4
                            }}>
                              TRACKED COMPETITOR
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px 20px',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: getShareOfVoiceColor(comp.shareOfVoice)
                        }} />
                        <span style={{ 
                          fontWeight: 700,
                          fontSize: 16,
                          color: '#111827'
                        }}>
                          {comp.shareOfVoice}%
                        </span>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px 20px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#111827'
                    }}>
                      #{comp.avgPosition}
                    </td>
                    <td style={{ 
                      padding: '16px 20px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      color: '#111827'
                    }}>
                      {comp.mentions}
                    </td>
                    <td style={{ 
                      padding: '16px 20px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: 14
                    }}>
                      {comp.keywordCoverage}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Showing X of Y indicator */}
      {!showAll && sortedCompetitors.length > 10 && (
        <div style={{
          marginTop: 16,
          padding: '12px',
          background: '#f9fafb',
          borderRadius: 8,
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 14
        }}>
          Showing top 10 of {sortedCompetitors.length} competitors
        </div>
      )}

      {/* Summary Stats */}
      <div style={{
        marginTop: 32,
        padding: 24,
        background: '#f9fafb',
        borderRadius: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>
            Total Competitors Found
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>
            {competitorData.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>
            Your Brand Position
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5' }}>
            {competitorData.find(c => c.isYourBrand) 
              ? `#${sortedCompetitors.findIndex(c => c.isYourBrand) + 1}`
              : 'Not Ranked'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontWeight: 600 }}>
            Top Competitor
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            {sortedCompetitors[0]?.name || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;