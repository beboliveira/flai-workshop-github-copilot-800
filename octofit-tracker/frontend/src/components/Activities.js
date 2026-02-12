import React, { useState, useEffect } from 'react';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchActivities(currentPage);
  }, [currentPage]);

  const fetchActivities = async (page) => {
    setLoading(true);
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/activities/?page=${page}`;
    } else {
      apiUrl = `http://localhost:8000/api/activities/?page=${page}`;
    }
    console.log('Activities - Fetching from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Activities - Fetched data:', data);
      
      // Handle paginated response from Django REST Framework
      if (data.results) {
        setActivities(data.results);
        setTotalCount(data.count);
        // Calculate total pages based on count and page size (10)
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        // Fallback for non-paginated response
        setActivities(data);
        setTotalCount(data.length);
        setTotalPages(1);
      }
      
      console.log('Activities - Processed data:', data.results || data);
      setLoading(false);
    } catch (error) {
      console.error('Activities - Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getActivityBadge = (difficulty) => {
    const badges = {
      'Easy': 'success',
      'Medium': 'warning',
      'Hard': 'danger',
      'Expert': 'dark'
    };
    return badges[difficulty] || 'secondary';
  };

  if (loading) return (
    <div className="container mt-4">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading activities...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-4">
      <div className="error-message">
        <h4>⚠️ Error Loading Activities</h4>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>📊 Recent Activities</h2>
      <p className="text-muted mb-4">Track all fitness activities across your team</p>
      {activities.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h5>No activities found</h5>
          <p>Start logging your workouts to see them here!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '25%' }}>User</th>
                <th style={{ width: '25%' }}>Workout</th>
                <th className="text-center" style={{ width: '15%' }}>Difficulty</th>
                <th className="text-center" style={{ width: '15%' }}>Duration</th>
                <th className="text-center" style={{ width: '10%' }}>Points</th>
                <th className="text-center" style={{ width: '10%' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity._id || index}>
                  <td>
                    <strong>{activity.user_email}</strong>
                  </td>
                  <td>
                    {activity.workout_name || 'Unknown Workout'}
                  </td>
                  <td className="text-center">
                    <span className={`badge bg-${getActivityBadge(activity.workout_difficulty)} px-3 py-2`}
                          style={{ fontSize: '0.85em', minWidth: '90px' }}>
                      {activity.workout_difficulty || 'N/A'}
                    </span>
                  </td>
                  <td className="text-center">
                    <strong>{activity.duration}</strong> min
                  </td>
                  <td className="text-center">
                    <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.9em', minWidth: '70px' }}>
                      {activity.points} pts
                    </span>
                  </td>
                  <td className="text-center">
                    <small>{new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination Controls */}
      {activities.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalCount)} de {totalCount} atividades
          </div>
          <div className="btn-group" role="group">
            <button 
              className="btn btn-outline-primary" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
            >
              ← Anterior
            </button>
            <button className="btn btn-outline-secondary" disabled>
              Página {currentPage} de {totalPages}
            </button>
            <button 
              className="btn btn-outline-primary" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Activities;
