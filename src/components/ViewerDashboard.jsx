import React from 'react';
import { useAuction } from '../context/AuctionContext';
import ViewerHeader from './ViewerHeader';

const ViewerDashboard = () => {
  const { teams, players } = useAuction();

  const soldPlayers = players.filter(player => player.sold);
  const availablePlayers = players.filter(player => !player.sold);

  return (
    <div>
      <ViewerHeader />
      <div className="viewer-container">
        <div className="viewer-dashboard">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{teams.length}</div>
              <div className="stat-label">Teams</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{soldPlayers.length}</div>
              <div className="stat-label">Players Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{availablePlayers.length}</div>
              <div className="stat-label">Available Players</div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-section">
              <h2>🏆 Team Owners & Players</h2>
              <div className="teams-grid">
                {teams.map(team => {
                  const teamPlayers = soldPlayers.filter(player => Number(player.soldTo) === Number(team.id));
                  const spent = teamPlayers.reduce((sum, player) => sum + (player.soldPrice || 0), 0);
                  const remaining = Math.max(0, team.purse - spent);

                  return (
                    <div key={team.id} className="team-roster-card">
                      <div className="team-roster-header">
                        <div className="team-owner-info">
                          <span className="owner-label">Team Owner</span>
                          <h3>{team.name}</h3>
                        </div>
                        <div className="team-roster-stats">
                          <span className="budget-spent">Spent: ₹{spent.toLocaleString()}</span>
                          <span className="budget-remaining">Left: ₹{remaining.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="team-roster-players">
                        {teamPlayers.length === 0 ? (
                          <p className="no-players">No players bought yet</p>
                        ) : (
                          <div className="players-list">
                            {teamPlayers.map(player => (
                              <div key={player.id} className="team-player-item">
                                <img
                                  src={player.image}
                                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80"; }}
                                  alt={player.name}
                                  className="team-player-avatar"
                                />
                                <div className="team-player-info">
                                  <span className="team-player-name">{player.name}</span>
                                </div>
                                <span className="team-player-price">₹{player.soldPrice?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>🏇 Available Players</h2>
              {availablePlayers.length === 0 ? (
                <div style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 16,
                  padding: '20px 16px',
                  textAlign: 'center',
                  boxShadow: '0 8px 20px rgba(4, 120, 87, 0.06)',
                  margin: '8px 0'
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    margin: '0 auto 10px auto',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: '0 6px 16px rgba(217, 119, 6, 0.25)',
                    border: '2px solid #ffffff'
                  }}>
                    🏆
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: '#047857', margin: '0 0 4px 0', fontStyle: 'italic' }}>
                    🎉 All Players Sold!
                  </h3>
                  <p style={{ color: '#475569', margin: '0 auto', fontSize: 12, lineHeight: 1.4, maxWidth: 400 }}>
                    The auction is officially complete. All players have been successfully assigned to team rosters.
                  </p>
                </div>
              ) : (
                <div className="available-players-grid">
                  {availablePlayers.map(player => (
                    <div key={player.id} className="available-player-card">
                      <div className="viewer-available-player-image-container">
                        <img
                          src={player.image}
                          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80"; }}
                          alt={player.name}
                          className="viewer-available-player-image"
                        />
                      </div>
                      <div className="viewer-available-player-info">
                        <div className="viewer-available-player-header">
                          <h4 className="viewer-available-player-name" title={player.name}>{player.name}</h4>
                          <div className="viewer-available-player-price" title={`Base Price: ₹${player.basePrice ? Number(player.basePrice).toLocaleString() : '10,000'}`}>
                            ₹{player.basePrice ? Number(player.basePrice).toLocaleString() : '10,000'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>🏆 Sold Players</h2>
              {soldPlayers.length === 0 ? (
                <div className="empty-state">
                  <h3>💰 No Sales Yet!</h3>
                  <p>The auction hasn't started yet. Check back once players start getting sold!</p>
                </div>
              ) : (
                <div className="viewer-sold-players-grid">
                  {soldPlayers.map(player => {
                    const team = teams.find(t => Number(t.id) === Number(player.soldTo));
                    return (
                      <div key={player.id} className="viewer-sold-player-card">
                        <div className="viewer-sold-player-image-container">
                          <img
                            src={player.image}
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80"; }}
                            alt={player.name}
                            className="viewer-sold-player-image"
                          />
                        </div>
                        <div className="viewer-sold-player-info">
                          <div className="viewer-sold-player-header">
                            <h4 className="viewer-sold-player-name" title={player.name}>{player.name}</h4>
                            <span className="viewer-sold-price">₹{player.soldPrice ? Number(player.soldPrice).toLocaleString() : '10,000'}</span>
                          </div>
                          <div className="viewer-sold-player-purchase">
                            <span className="viewer-team-label">Buyer:</span>
                            <span className="viewer-team-name">{team?.name || 'Team'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerDashboard;