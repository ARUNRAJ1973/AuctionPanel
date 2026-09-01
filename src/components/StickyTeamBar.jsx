import React, { useMemo, useState, useEffect } from "react";
import { useAuction } from "../context/AuctionContext";

const StickyTeamBar = ({ enableDetails = false }) => {
  const { teams, players } = useAuction();
  const [expanded, setExpanded] = useState(null);

  // Lock background scrolling when team details dropdown is opened
  useEffect(() => {
    if (enableDetails && expanded) {
      document.body.classList.add('no-scroll');
      document.documentElement.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('no-scroll');
      document.documentElement.classList.remove('no-scroll');
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [enableDetails, expanded]);

  const purchases = useMemo(() => {
    const map = new Map();
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

  const fallbackImg = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=200&auto=format&fit=crop&q=80";

  return (
    <div className="sticky-teams-wrapper">
      <div className="sticky-teams">
        {teams.map(t => {
          const remaining = Math.max(0, t.purse - t.spent);
          const isOpen = String(expanded) === String(t.id);
          return (
            <div 
              key={t.id} 
              className={`team-chip ${isOpen ? 'open' : ''} ${enableDetails ? 'clickable' : ''}`}
              onClick={enableDetails ? () => setExpanded(isOpen ? null : t.id) : undefined}
              style={{ cursor: enableDetails ? 'pointer' : 'default' }}
            >
              <div className="team-chip__left">
                <div className="team-chip__name">{t.name}</div>
              </div>
              <div className="team-chip__right">
                <div className="team-chip__purse">₹{remaining.toLocaleString()} left</div>
                {enableDetails && (
                  <button 
                    className="team-chip__arrow" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(isOpen ? null : t.id);
                    }} 
                    title={isOpen ? "Hide details" : "Show details"} 
                    type="button"
                  >
                    {isOpen ? '▾' : '▸'}
                  </button>
                )}
              </div>
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
                <div className="sticky-details__header" style={{ marginBottom: 8, paddingBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#d97706', fontStyle: 'italic' }}>{t ? t.name : 'Team'}</span>
                    <span style={{ color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>Purse Remaining: ₹{remaining.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setExpanded(null)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                {list.length === 0 ? (
                  <div className="empty" style={{ color: '#64748b', fontStyle: 'italic', padding: '16px 0', textAlign: 'center', fontSize: '14px' }}>
                    No players bought by {t ? t.name : 'this team'} yet.
                  </div>
                ) : (
                  <ul className="list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px', padding: 0, margin: '6px 0 0 0', listStyle: 'none' }}>
                    {list.map(i => (
                      <li key={i.id} className="sticky-details__item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 8px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        <span className="player-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={i.image || fallbackImg} 
                            onError={(e) => { e.target.src = fallbackImg; }}
                            alt={i.name} 
                            style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid #cbd5e1' }} 
                          />
                          <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '13px', fontStyle: 'italic' }}>{i.name}</span>
                        </span>
                        <span style={{ color: '#047857', fontWeight: 900, fontSize: '12px', fontStyle: 'italic', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '5px' }}>
                          ₹{i.price.toLocaleString()}
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
