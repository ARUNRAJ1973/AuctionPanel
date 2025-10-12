import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { useAuth } from "../context/AuthContext";
import MobileUserDrawer from "./MobileUserDrawer";

const StickyTeamBar = ({ enableDetails = false }) => {
  const { teams, players } = useAuction();
  const { logout, user, isAdmin } = useAuth();
  const [expanded, setExpanded] = useState(null);

  const purchases = useMemo(() => {
    const map = new Map();
    // Use string keys for consistency
    teams.forEach(t => map.set(String(t.id), []));
    players.forEach(p => {
      if (p.sold && p.soldTo) {
        const soldToKey = String(p.soldTo);
        if (map.has(soldToKey)) {
          map.get(soldToKey).push({ id: p.id, name: p.name, price: p.soldPrice, image: p.image });
        }
      }
    });
    return map;
  }, [teams, players]);

  return (
    <div>
      <div className="sticky-header">
        <div className="sticky-header__left">
          <div className="sticky-header__title">KPL Auction</div>
        </div>
        <div className="sticky-header__right">
          <div className="user-info">
            <span className="user-name">Hello, {user?.name || 'User'}</span>
            <span className="user-role">{isAdmin() ? '👑 Admin' : '👤 Viewer'}</span>
          </div>
          <button className="header-logout-btn" 
          onClick={() => {
          if (window.confirm('Are you sure you want to delete this item?')) {
            logout();
          }
        }}
          title="Logout">
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
          <MobileUserDrawer />
        </div>
      </div>
      <div className="sticky-teams">
          {teams.map(t => {
          const remaining = Math.max(0, t.purse - t.spent);
          const isOpen = String(expanded) === String(t.id);
          return (
            <div key={t.id} className={`team-chip ${isOpen ? 'open' : ''}`}>
              <div className="team-chip__name">{t.name}</div>
              <div className="team-chip__purse">₹{remaining.toLocaleString()} left</div>
              {enableDetails && (
                <button 
                  className="team-chip__arrow" 
                  onClick={() => setExpanded(isOpen ? null : t.id)} 
                  title={isOpen ? "Hide details" : "Show details"} 
                  type="button"
                  style={{ minWidth: '32px', minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {isOpen ? '▾' : '▸'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {enableDetails && expanded && (
        <div className="sticky-details">
          {(() => {
            const t = teams.find(x => Number(x.id) === Number(expanded));
            const list = purchases.get(String(expanded)) || [];
            const remaining = Math.max(0, t.purse - t.spent);
            return (
              <div>
                <div className="sticky-details__header">
                  <span style={{fontSize:25 ,color:'#fe0101ff',fontWeight:'bold' }}>{t.name}</span>
                  <span className="muted" style={{fontSize:22 , color:'#fe0101ff',fontWeight:'bold'}}> {"-->"} Remaining ₹{remaining.toLocaleString()}</span>
                </div>
                {list.length === 0 ? (
                  <div className="empty">No players bought yet</div>
                ) : (
                  <ul className="list">
                    {list.map(i => (
                      <li key={i.id} className="list__item list__item--space-between sticky-details__item">
                        <span className="player-row">
                          <img src={i.image} alt={i.name} />
                          <span style={{fontSize:20 ,color:'#000000ff',fontWeight:'bold' }}>{i.name}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{fontSize:20 ,color:'#000000ff',fontWeight:'bold' }}>₹{i.price.toLocaleString()}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default StickyTeamBar;
