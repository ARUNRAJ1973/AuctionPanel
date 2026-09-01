import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import { useAuth } from "../context/AuthContext";
import PlayerCard from "./PlayerCard";
import ConfirmModal from "./ConfirmModal";

const PlayerList = () => {
  const { players, deletePlayer, selectedPlayerId, undoAllSales } = useAuction();
  const { logout } = useAuth();
  const [query, setQuery] = useState("");

  const [showUndoAllModal, setShowUndoAllModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? players.filter(p => `${p.name} ${p.role}`.toLowerCase().includes(q))
      : players;
    return [...list].sort((a, b) => Number(a.sold) - Number(b.sold));
  }, [players, query]);

  const goAuction = (id) => {
    window.location.hash = `#/auction/${id}`;
  };

  const handleConfirmUndoAll = async () => {
    const ok = await undoAllSales();
    if (!ok) {
      alert('Failed to undo all sales');
    }
  };

  const handleConfirmLogout = () => {
    logout();
  };

  const handleUndoAllClick = () => {
    const hasSold = players.some(p => p.sold);
    if (!hasSold) {
      alert('No sold players to undo.');
      return;
    }
    setShowUndoAllModal(true);
  };

  return (
    <>
      <section className="panel player-list-panel" style={{
        marginTop: 20,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 20,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%'
      }}>
        <div className="panel__header-row" style={{ marginBottom: 14 }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 900,
            color: '#0f172a',
            margin: 0,
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>🏏</span> Players ({filtered.length})
          </h2>
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
        <div style={{
          marginTop: 16,
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button
            className="btn danger"
            style={{
              flex: 1,
              minHeight: '42px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '12px',
              borderRadius: 8,
              border: 'none',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              boxSizing: 'border-box',
              padding: '0 6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title="Undo All Player Sales"
            onClick={handleUndoAllClick}
            type="button"
          >
            🔄 Undo All Sales
          </button>

          <button
            className="btn danger outline"
            style={{
              flex: 1,
              minHeight: '42px',
              background: 'linear-gradient(135deg, #991b1b, #7f1d1d)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(153, 27, 27, 0.3)',
              boxSizing: 'border-box',
              padding: '0 6px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
            title="Logout"
            onClick={() => setShowLogoutModal(true)}
            type="button"
          >
            🚪 Logout
          </button>
        </div>
      </section>

      {/* Modal for Undo All Sales */}
      <ConfirmModal
        isOpen={showUndoAllModal}
        onClose={() => setShowUndoAllModal(false)}
        onConfirm={handleConfirmUndoAll}
        title="Undo All Player Sales"
        message="Are you sure you want to undo ALL player sales? All sold players will return to unsold status."
        confirmText="Undo All Sales"
        cancelText="Cancel"
        icon="🔄"
        variant="warning"
      />

      {/* Modal for Logout */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out of your admin session?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        icon="🚪"
        variant="danger"
      />
    </>
  );
};

export default PlayerList;
