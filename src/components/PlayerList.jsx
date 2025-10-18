import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { useAuth } from "../context/AuthContext";
import PlayerCard from "./PlayerCard";

const PlayerList = () => {
  const { players, deletePlayer, selectedPlayerId } = useAuction();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? players.filter(p => `${p.name} ${p.role}`.toLowerCase().includes(q))
      : players;
    // Prefer unsold first
    return [...list].sort((a, b) => Number(a.sold) - Number(b.sold));
  }, [players, query]);

  const goAuction = (id) => {
    window.location.hash = `#/auction/${id}`;
  };

  return (
    <section className="panel">
      <div className="panel__header-row">
        <h2 className="panel__title">Players</h2>
        {/* <input
          type="search"
          placeholder="Search Player"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            minHeight: '44px',
            fontSize: window.innerWidth <= 768 ? '16px' : '14px', // Prevent zoom on iOS
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: '#0b1220',
            color: 'var(--text)',
            width: window.innerWidth <= 480 ? '100%' : 'auto',
            boxSizing: 'border-box'
          }}
        /> */}
      </div>
      <div className="grid grid--players grid--3cols">
        {filtered.map(p => (
          <PlayerCard
            key={p.id}
            player={p}
            onAuction={goAuction}
            onDelete={deletePlayer}
            isSelected={selectedPlayerId === p.id}
          />
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          className="btn danger outline"
          style={{ width: '100%', minHeight: '44px' }}
          title="Logout"
          onClick={() => {
            if (window.confirm('Are you sure you want to Logout ?')) {
              logout();
            }
          }}
        >
          Logout
        </button>
      </div>
    </section>
  );
};

export default PlayerList;
