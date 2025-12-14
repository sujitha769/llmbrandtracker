import React, { useEffect, useState } from "react";

const Keywords = ({ userEmail, selectedSite }) => {
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gsc/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, siteUrl: selectedSite }),
    });

    const data = await res.json();
    setKeywords(data.keywords || []);
  };

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-3" onClick={() => window.history.back()}>
        ← Back
      </button>

      <h3 className="mb-4">Keywords for: <span className="text-primary">{selectedSite}</span></h3>

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>Keyword</th>
            <th>Impressions</th>
            <th>Clicks</th>
            <th>CTR</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {keywords.map((row, i) => (
            <tr key={i}>
              <td>{row.keys[0]}</td>
              <td>{row.impressions}</td>
              <td>{row.clicks}</td>
              <td>{(row.ctr * 100).toFixed(2)}%</td>
              <td>{row.position.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Keywords;
