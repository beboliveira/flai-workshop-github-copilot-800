import React, { useState, useEffect } from 'react';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/`;
    } else {
      apiUrl = 'http://localhost:8000/api/teams/';
    }
    console.log('Teams - Fetching from API endpoint:', apiUrl);
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Teams - Fetched data:', data);
      
      const teamsData = data.results || data;
      setTeams(teamsData);
      setLoading(false);
    } catch (error) {
      console.error('Teams - Error fetching data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/users/`;
    } else {
      apiUrl = 'http://localhost:8000/api/users/';
    }
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const usersData = data.results || data;
      setUsers(usersData);
    } catch (error) {
      console.error('Users - Error fetching data:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/`;
    } else {
      apiUrl = 'http://localhost:8000/api/teams/';
    }
    
    try {
      // Get the next team_id
      const nextTeamId = teams.length > 0 
        ? Math.max(...teams.map(t => t.team_id)) + 1 
        : 1;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: nextTeamId,
          name: newTeam.name,
          description: newTeam.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchTeams();
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team: ' + error.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !selectedUserId) return;

    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/add-member/`;
    } else {
      apiUrl = 'http://localhost:8000/api/teams/add-member/';
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: selectedTeam.team_id,
          user_id: selectedUserId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchTeams();
      await fetchUsers();
      setShowAddMemberModal(false);
      setSelectedUserId('');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member: ' + error.message);
    }
  };

  const handleRemoveMember = async (team, userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    let apiUrl;
    if (process.env.REACT_APP_CODESPACE_NAME) {
      apiUrl = `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/remove-member/`;
    } else {
      apiUrl = 'http://localhost:8000/api/teams/remove-member/';
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: team.team_id,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchTeams();
      await fetchUsers();
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member: ' + error.message);
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

  const openAddMemberModal = (team) => {
    setSelectedTeam(team);
    setShowAddMemberModal(true);
  };

  // Get users without a team for the dropdown
  const availableUsers = users.filter(user => !user.team_id);

  if (loading) return (
    <div className="container mt-4">
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading teams...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mt-4">
      <div className="error-message">
        <h4>⚠️ Error Loading Teams</h4>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>👥 Teams</h2>
          <p className="text-muted mb-0">Join a team and compete together</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>Create New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="alert alert-info" role="alert">
          <h5>No teams found</h5>
          <p>Create a team to get started!</p>
        </div>
      ) : (
        <div className="row">
          {teams.map((team) => (
            <div key={team._id} className="col-lg-6 col-md-12 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{team.name}</h5>
                      <span className="badge bg-success me-2">{team.member_count || 0} Members</span>
                    </div>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => openAddMemberModal(team)}
                    >
                      <i className="bi bi-person-plus"></i> Add Member
                    </button>
                  </div>
                  <p className="card-text mb-3">{team.description}</p>
                  
                  <div className="team-members">
                    <h6 className="text-muted mb-3">Team Members:</h6>
                    {team.members && team.members.length > 0 ? (
                      <div className="list-group">
                        {team.members.map((member) => (
                          <div 
                            key={member._id} 
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong className="member-name">{member.name}</strong>
                              <br />
                              <small className="member-email">{member.email}</small>
                              <br />
                              <span className={`badge bg-${getFitnessLevelBadge(member.fitness_level)} mt-1`}>
                                {member.fitness_level}
                              </span>
                            </div>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveMember(team, member._id)}
                              title="Remove member"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">No members yet. Add someone to get started!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Team</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowCreateModal(false)}
              ></button>
            </div>
            <form onSubmit={handleCreateTeam}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="teamName" className="form-label">Team Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="teamName"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    required
                    placeholder="Enter team name"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="teamDescription" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="teamDescription"
                    rows="3"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    required
                    placeholder="Describe your team's goals and mission"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Add Member to {selectedTeam?.name}</h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowAddMemberModal(false)}
              ></button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="userSelect" className="form-label">Select User</label>
                  {availableUsers.length > 0 ? (
                    <select
                      className="form-select"
                      id="userSelect"
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="">Choose a user...</option>
                      {availableUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-warning">All users are already assigned to teams!</p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddMemberModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={availableUsers.length === 0}
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
