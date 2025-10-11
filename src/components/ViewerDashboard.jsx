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
          <div className="dashboard-header">
            <h1>🏏 KPL Auction Dashboard</h1>
            <p>Welcome to the KPL Auction viewing portal. Here you can see all teams, players, and auction results.</p>
          </div>

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
              <h2>🏆 Team Owners & Their Players</h2>
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
                          <span className="budget-spent">₹{spent.toLocaleString()} spent</span>
                          <span className="budget-remaining">₹{remaining.toLocaleString()} left</span>
                        </div>
                      </div>
                      <div className="team-roster-players">
                        {teamPlayers.length === 0 ? (
                          <p className="no-players">No players yet</p>
                        ) : (
                          <div className="players-list">
                            {teamPlayers.map(player => (
                              <div key={player.id} className="team-player-item">
                                <img src={player.image} alt={player.name} className="team-player-avatar" />
                                <div className="team-player-info">
                                  <span className="team-player-name">{player.name}</span>
                                  <span className="team-player-role">{player.role}</span>
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
                          <img src={player.image} alt={player.name} className="viewer-sold-player-image" />
                          <div className="viewer-sold-badge">SOLD</div>
                        </div>
                        <div className="viewer-sold-player-info">
                          <div className="viewer-player-header">
                            <h4 className="viewer-sold-player-name">{player.name}</h4>
                            <p className="viewer-sold-player-role">{player.role}</p>
                          </div>
                          <div className="viewer-sold-player-stats">
                            {player.stats && (
                              <>
                                {player.stats.age && <span>Age: {player.stats.age}</span>}
                                <span>Matches: {player.stats.matches}</span>
                                <span>Runs: {player.stats.runs}</span>
                                <span>Wickets: {player.stats.wickets || 0}</span>
                              </>
                            )}
                          </div>
                          <div className="viewer-sold-player-purchase">
                            <div className="viewer-sold-to-team">
                              <span className="viewer-team-label">Team Owner:</span>
                              <span className="viewer-team-name">{team?.name || 'Unknown Team'}</span>
                            </div>
                            <div className="viewer-sold-price">₹{player.soldPrice?.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>🏇 Available Players</h2>
              {availablePlayers.length === 0 ? (
                <div className="empty-state">
                  <h3>🎉 All Players Sold!</h3>
                  <p>The auction is complete. All players have been assigned to teams.</p>
                </div>
              ) : (
                <div className="available-players-grid">
                  {availablePlayers.map(player => (
                    <div key={player.id} className="available-player-card">
                      <img src={player.image} alt={player.name} className="viewer-available-player-image" />
                      <div className="viewer-available-player-info">
                        <div className="viewer-available-player-header">
                          <h4 className="viewer-available-player-name">{player.name}</h4>
                          <p className="viewer-available-player-role">{player.role}</p>
                        </div>
                        <div className="viewer-available-player-stats">
                          {player.stats ? (
                            <>
                              {player.stats.age && <span>Age: {player.stats.age}</span>}
                              <span>Matches: {player.stats.matches}</span>
                              <span>Runs: {player.stats.runs}</span>
                              <span>Wickets: {player.stats.wickets || 0}</span>
                            </>
                          ) : (
                            <span>No stats available</span>
                          )}
                        </div>
                        <div className="viewer-available-player-price">Base Price: ₹{player.basePrice?.toLocaleString() || 'TBD'}</div>
                      </div>
                    </div>
                  ))}
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