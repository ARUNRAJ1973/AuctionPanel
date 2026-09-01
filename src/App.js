import './App.css';
import './styles/Auction.css';
import StickyTeamBar from './components/StickyTeamBar';
import TeamManager from './components/TeamManager';
import AddPlayer from './components/AddPlayer';
import PlayerList from './components/PlayerList';
import AuctionPanel from './components/AuctionPanel';
import SoldList from './components/SoldList';
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import ViewerDashboard from './components/ViewerDashboard';
import PlayerAuctionSpinner from './components/PlayerAuctionSpinner';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { AdminOnly } from './components/RoleBasedAccess';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useMemo, useState } from 'react';

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  const parts = useMemo(() => hash.replace(/^#\/?/, '').split('/').filter(Boolean), [hash]);
  return parts; // e.g., ['auction','12']
}

const AdminMainPage = () => {
  return (
    <div>
      <StickyTeamBar enableDetails={true} />
      <div className="au-container">
        <div className="main-grid">
          <div>
            <PlayerAuctionSpinner />
            <TeamManager />
            <AddPlayer />
          </div>
          <PlayerList />
        </div>
      </div>
    </div>
  );
};

const AuctionPage = ({ playerId }) => {
  const { selectPlayer, clearSelected, teamById, undoSale, loading, players, selectedPlayer } = useAuction();
  const [soldInfo, setSoldInfo] = useState(null); // {teamId, playerId, price}

  useEffect(() => {
    if (playerId) {
      selectPlayer(Number(playerId));
    }
    return () => clearSelected();
  }, [playerId, selectPlayer, clearSelected, players.length]);
  
  // Show loading while data is being fetched
  if (loading) {
    return (
      <div>
        <StickyTeamBar enableDetails={true} />
        <div className="au-container">
          <section>
            <div className="panel">
              <h2 className="panel__title">Auction</h2>
              <div className="empty">Loading auction data...</div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StickyTeamBar enableDetails={true} />
      <div className="au-container">
        <section>
          <AuctionPanel onSold={(info) => setSoldInfo(info)} />
        </section>
      </div>
      {soldInfo && (() => {
        const player = selectedPlayer || players.find(p => Number(p.id) === Number(soldInfo.playerId));
        const team = teamById(soldInfo.teamId);
        const price = soldInfo.price || player?.soldPrice || player?.basePrice || 10000;

        return (
          <div className="overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 99999 }}>
            <div className="sold-popup-card">
              <div className="sold-popup-badge">🎉 PLAYER SOLD</div>
              
              <div className="sold-popup-player">
                <img 
                  src={player?.image} 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=150&auto=format&fit=crop&q=80"; }} 
                  alt={player?.name} 
                  className="sold-popup-avatar"
                />
                <div className="sold-popup-details">
                  <h2 className="sold-popup-title">{player?.name || 'Player'}</h2>
                  <p className="sold-popup-subtitle">
                    Successfully sold to <span className="sold-popup-team">{team?.name || 'Team'}</span>
                  </p>
                  <div className="sold-popup-price">
                    Winning Bid: ₹{Number(price).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="sold-popup-actions">
                <button 
                  className="btn primary" 
                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none' }}
                  onClick={() => { window.location.hash = '#/'; }}
                >
                  Go to Main Page
                </button>
                <button 
                  className="btn danger" 
                  style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }}
                  onClick={() => { 
                    undoSale(soldInfo.playerId); 
                    setSoldInfo(null); 
                    selectPlayer(soldInfo.playerId); 
                  }}
                >
                  Undo Sale
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

  const AppContent = () => {
    const parts = useHashRoute();
    const route = parts[0] || '';
    const id = parts[1];
    const { isAuthenticated, showWelcome, completeWelcome, loading, user, isAdmin } = useAuth();

    // Apply viewer-only theme class on body without changing UI layout
    useEffect(() => {
      const cls = 'theme-viewer';
      const isAdminRole = isAdmin();
      if (!isAdminRole) {
        document.body.classList.add(cls);
      } else {
        document.body.classList.remove(cls);
      }
      return () => {
        document.body.classList.remove(cls);
      };
    }, [isAdmin, user]);

    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading KPL Auction...</p>
          </div>
        </div>
      );
    }

    if (showWelcome) {
      return <WelcomeScreen onComplete={completeWelcome} />;
    }

    if (!isAuthenticated) {
      return <LoginPage />;
    }

    return (
      <AuctionProvider>
        <PwaInstallPrompt />
        {route === 'auction' ? (
          <AdminOnly fallback={
            <div className="access-denied">
              <div className="access-denied-content">
                <h3>🚫 Access Restricted</h3>
                <p>Only administrators can access the auction panel.</p>
                <button onClick={() => window.location.hash = '#/'} className="btn primary">Go to Dashboard</button>
              </div>
            </div>
          }>
            <AuctionPage playerId={id} />
          </AdminOnly>
        ) : (
          // Show different dashboards based on role
          isAdmin() ? <AdminMainPage /> : <ViewerDashboard />
        )}
        <button 
          className="mobile-reload-fab"
          onClick={() => window.location.reload()}
          title="Reload Page"
          aria-label="Reload Page"
        >
          🔄
        </button>
      </AuctionProvider>
    );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
