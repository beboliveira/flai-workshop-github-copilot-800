import React, { useState, useEffect } from 'react';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/workouts/`;
    } else {
      apiUrl = 'http://localhost:8000/api/workouts/';
    }
    console.log('Workouts - Fetching from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Workouts - Fetched data:', data);
      
      // Handle both paginated (.results) and plain array responses
      const workoutsData = data.results || data;
      console.log('Workouts - Processed data:', workoutsData);
      setWorkouts(workoutsData);
      setLoading(false);
    } catch (error) {
      console.error('Workouts - Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      'Easy': 'success',
      'Medium': 'warning',
      'Hard': 'danger',
      'Expert': 'dark'
    };
    return badges[level] || 'secondary';
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      'Cardio': '🏃',
      'Strength': '💪',
      'Flexibility': '🧘',
      'HIIT': '⚡',
      'Endurance': '🚴'
    };
    return icons[type] || '🏋️';
  };

  if (loading) return (
    <div className="container mt-4">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading workouts...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-4">
      <div className="error-message">
        <h4>⚠️ Error Loading Workouts</h4>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>💪 Personalized Workouts</h2>
      <p className="text-muted mb-4">Recommended workout plans tailored to your fitness level</p>
      {workouts.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h5>No workouts found</h5>
          <p>Check back soon for personalized workout recommendations!</p>
        </div>
      ) : (
        <div className="row">
          {workouts.map((workout, index) => (
            <div key={workout.id || index} className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title">
                      {getWorkoutIcon(workout.workout_type)} {workout.name}
                    </h5>
                    <span className={`badge bg-${getDifficultyBadge(workout.difficulty_level)}`}>
                      {workout.difficulty_level}
                    </span>
                  </div>
                  <p className="card-text text-muted">{workout.description}</p>
                  <hr />
                  <div className="row text-center mt-3">
                    <div className="col-3">
                      <div className="mb-1">
                        <small className="text-muted">Type</small>
                      </div>
                      <span className="badge bg-primary">{workout.workout_type}</span>
                    </div>
                    <div className="col-3">
                      <div className="mb-1">
                        <small className="text-muted">Duration</small>
                      </div>
                      <strong>{workout.duration}</strong>
                      <small> min</small>
                    </div>
                    <div className="col-3">
                      <div className="mb-1">
                        <small className="text-muted">Difficulty</small>
                      </div>
                      <strong>{workout.difficulty_level}</strong>
                    </div>
                    <div className="col-3">
                      <div className="mb-1">
                        <small className="text-muted">Calories</small>
                      </div>
                      <strong>{workout.calories_burned}</strong>
                      <small> kcal</small>
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-top text-center">
                  <button className="btn btn-primary btn-sm w-100">Start Workout</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workouts;
