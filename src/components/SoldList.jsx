import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const SoldList = () => {
  const { players, teams, undoSale } = useAuction();
  const [filterTeam, setFilterTeam] = useState("");

  const soldPlayers = useMemo(() => {
    return players.filter(p => p.sold && (!filterTeam || String(p.soldTo) === String(filterTeam)));
  }, [players, filterTeam]);

  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2 className="panel__title">Sold Players</h2>
        <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
          <option value="">All teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      {soldPlayers.length === 0 ? (
        <div className="empty">No players sold yet</div>
      ) : (
        <ul className="list">
          {soldPlayers.map(p => {
            const team = teams.find(t => t.id === p.soldTo);
            return (
              <li key={p.id} className="list__item list__item--space-between">
                <span>
                  <strong>{p.name}</strong>
                  <span className="muted"> • {p.role}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>
                    ₹{p.soldPrice.toLocaleString()} <span className="muted">to {team?.name || p.soldTo}</span>
                  </span>
                  <button 
                    className="btn small outline" 
                    onClick={async () => {
                      const success = await undoSale(p.id);
                      if (!success) {
                        alert('Failed to undo sale');
                      }
                    }}
                    title="Undo this sale"
                  >
                    Undo
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default SoldList;
