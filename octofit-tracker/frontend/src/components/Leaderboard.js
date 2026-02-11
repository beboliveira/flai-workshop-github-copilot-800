import React, { useState, useEffect } from 'react';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/leaderboard/`;
    } else {
      apiUrl = 'http://localhost:8000/api/leaderboard/';
    }
    console.log('Leaderboard - Fetching from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Leaderboard - Fetched data:', data);
      
      // Handle both paginated (.results) and plain array responses
      const leaderboardData = data.results || data;
      console.log('Leaderboard - Processed data:', leaderboardData);
      setLeaderboard(leaderboardData);
      setLoading(false);
    } catch (error) {
      console.error('Leaderboard - Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'table-warning';
    if (rank === 2) return 'table-secondary';
    if (rank === 3) return 'table-danger';
    return '';
  };

  if (loading) return (
    <div className="container mt-4">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading leaderboard...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-4">
      <div className="error-message">
        <h4>⚠️ Error Loading Leaderboard</h4>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>🏆 Leaderboard</h2>
      <p className="text-muted mb-4">Top performing teams and their standings</p>
      {leaderboard.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h5>No leaderboard entries found</h5>
          <p>Complete activities to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th className="text-center" width="80">Rank</th>
                <th style={{ width: '40%' }}>Team</th>
                <th className="text-center" style={{ width: '20%' }}>Total Points</th>
                <th className="text-center" style={{ width: '20%' }}>Activities</th>
                <th className="text-center" style={{ width: '20%' }}>Avg Points/Activity</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.team_id || index} className={getRankClass(entry.rank)}>
                  <td className="text-center">
                    <h4 className="mb-0">{getRankBadge(entry.rank)}</h4>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1.1em' }}>{entry.team_name}</strong>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>
                      {entry.total_points.toLocaleString()} pts
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-info" style={{fontSize: '0.95rem', padding: '0.45rem 0.9rem'}}>
                      {entry.total_activities}
                    </span>
                  </td>
                  <td className="text-center">
                    <strong>{entry.total_activities > 0 ? Math.round(entry.total_points / entry.total_activities) : 0}</strong> pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
