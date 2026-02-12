import React, { useState, useEffect } from 'react';

function Users() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    team_id: '',
    fitness_level: 'Beginner'
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    // Build API URL with fallback
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/users/`;
    } else {
      apiUrl = 'http://localhost:8000/api/users/';
    }
    
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    apiUrl += `?_t=${timestamp}`;
    
    console.log('Users - Fetching from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users - Fetched data:', data);
      
      // Handle both paginated (.results) and plain array responses
      const usersData = data.results || data;
      console.log('Users - Processed data:', usersData);
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Users - Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    // Build API URL with fallback
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/?simple=true`;
    } else {
      apiUrl = 'http://localhost:8000/api/teams/?simple=true';
    }
    
    console.log('Users - Fetching teams from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const teamsData = data.results || data;
      setTeams(teamsData);
    } catch (error) {
      console.error('Users - Error fetching teams:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Build API URL with fallback
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/users/`;
    } else {
      apiUrl = 'http://localhost:8000/api/users/';
    }
    
    // Prepare data - only include team_id if selected
    const submitData = {
      name: formData.name,
      email: formData.email,
      fitness_level: formData.fitness_level
    };
    
    if (formData.team_id) {
      submitData.team_id = parseInt(formData.team_id);
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        // Check if response is JSON or HTML
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Erro ao criar utilizador';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.email?.[0] || errorData.detail || errorMessage;
        } else {
          // Server returned HTML (probably error 500)
          const errorText = await response.text();
          console.error('Server error:', errorText);
          errorMessage = `Erro do servidor (${response.status}). Verifica se o backend está a correr.`;
        }
        
        throw new Error(errorMessage);
      }

      const newUser = await response.json();
      console.log('User created:', newUser);
      
      setFormSuccess('✅ Utilizador criado com sucesso!');
      setFormData({
        name: '',
        email: '',
        team_id: '',
        fitness_level: 'Beginner'
      });
      
      // Refresh user list immediately
      await fetchUsers();
      
      // Hide form after 2 seconds
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess(null);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating user:', error);
      setFormError(error.message);
    }
  };

  const getFitnessLevelBadge = (level) => {
    const badges = {
      'Beginner': 'success',
      'Intermediate': 'warning',
      'Advanced': 'danger',
      'Expert': 'dark'
    };
    return badges[level] || 'secondary';
  };

  const getTeamColor = (teamName) => {
    const teamColors = {
      'Team Marvel': { bg: '#e03131', text: '#ffffff' },      // Vermelho forte
      'Team DC': { bg: '#1971c2', text: '#ffffff' },          // Azul forte
      'No Team': { bg: '#868e96', text: '#ffffff' }           // Cinza
    };
    return teamColors[teamName] || { bg: '#495057', text: '#ffffff' };
  };

  if (loading) return (
    <div className="container mt-4">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading users...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-4">
      <div className="error-message">
        <h4>⚠️ Error Loading Users</h4>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>👤 Users</h2>
          <p className="mb-0" style={{ color: '#d1d8e6', fontSize: '1.1rem' }}>All registered OctoFit Tracker members</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '➕ Adicionar Utilizador'}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Criar Novo Utilizador</h5>
            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="alert alert-success" role="alert">
                {formSuccess}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="name" className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="fitness_level" className="form-label">Nível de Fitness *</label>
                  <select
                    className="form-select"
                    id="fitness_level"
                    name="fitness_level"
                    value={formData.fitness_level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="team_id" className="form-label">Equipa (opcional)</label>
                  <select
                    className="form-select"
                    id="team_id"
                    name="team_id"
                    value={formData.team_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Sem equipa</option>
                    {teams.map(team => (
                      <option key={team.team_id} value={team.team_id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-success">
                ✓ Criar Utilizador
              </button>
            </form>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h5>No users found</h5>
          <p>Be the first to join OctoFit Tracker!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th style={{ width: '30%' }}>Email</th>
                <th style={{ width: '25%' }}>Full Name</th>
                <th className="text-center" style={{ width: '20%' }}>Fitness Level</th>
                <th className="text-center" style={{ width: '25%' }}>Team</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id || index}>
                  <td>
                    <i className="bi bi-envelope me-2" style={{ color: '#007bff' }}></i>
                    <span style={{ fontSize: '1rem', color: '#212529', fontWeight: '500' }}>{user.email}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1.1rem', color: '#000000', fontWeight: '700' }}>{user.full_name}</strong>
                  </td>
                  <td className="text-center">
                    <span className={`badge bg-${getFitnessLevelBadge(user.fitness_level)} px-3 py-2`} 
                          style={{ fontSize: '0.95rem', minWidth: '120px' }}>
                      {user.fitness_level}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge px-3 py-2" 
                          style={{ 
                            fontSize: '1rem', 
                            minWidth: '140px',
                            fontWeight: '700',
                            backgroundColor: getTeamColor(user.team_name || 'No Team').bg,
                            color: getTeamColor(user.team_name || 'No Team').text,
                            border: '2px solid rgba(0,0,0,0.2)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                          }}>
                      {user.team_name || 'No Team'}
                    </span>
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

export default Users;
