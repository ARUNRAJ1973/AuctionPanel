import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import ConfirmModal from "./ConfirmModal";

const TeamManager = () => {
  const { teams, addTeam, removeTeam, setAllPurse, renameTeam, players } = useAuction();
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [deletingTeam, setDeletingTeam] = useState(null);

  const teamSoldCount = useMemo(() => {
    const map = Object.create(null);
    teams.forEach(t => { map[t.id] = 0; });
    players.forEach(p => { if (p.soldTo) map[p.soldTo] = (map[p.soldTo] || 0) + 1; });
    return map;
  }, [teams, players]);

  const handleAddInline = (name) => {
    if (teams.length >= 7) return;
    addTeam(name);
  };

  return (
    <>
      <section className="panel" style={{
        marginTop: 16,
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 14,
        padding: '14px 12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%'
      }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          gap: 8,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 style={{
              fontSize: 15,
              fontWeight: 900,
              color: '#0f172a',
              margin: 0,
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              <span>👥</span> Teams owners
            </h2>
            <span style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '1px 6px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800
            }}>
              {teams.length} TEAMS
            </span>
          </div>

          {/* Purse Setting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
              Purse Amount (₹):
            </label>
            <input
              type="number"
              min="0"
              value={teams[0]?.purse ?? 400000}
              onChange={(e) => setAllPurse(e.target.value)}
              placeholder="Purse Amount"
              title="Set default purse for all teams"
              style={{
                width: 90,
                padding: '3px 6px',
                borderRadius: 6,
                border: '1.5px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 800,
                color: '#0f172a',
                textAlign: 'right',
                outline: 'none',
                background: '#f8fafc'
              }}
            />
          </div>
        </div>

        {/* Team Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {teams.map((t) => {
            const count = teamSoldCount[t.id] || 0;
            const canDelete = count === 0;
            const remaining = Math.max(0, t.purse - t.spent);
            const isEditing = editingId === t.id;

            return (
              <div
                key={t.id}
                style={{
                  background: isEditing ? '#fffbebf0' : '#f8fafc',
                  border: isEditing ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 10px',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box'
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1.5px solid #f59e0b',
                        fontSize: 13,
                        fontWeight: 700,
                        outline: 'none'
                      }}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Team name"
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { renameTeam(t.id, editingName); setEditingId(null); }}
                        disabled={!editingName.trim()}
                        style={{
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: editingName.trim() ? 'pointer' : 'not-allowed',
                          opacity: editingName.trim() ? 1 : 0.6
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setDeletingTeam(t);
                          }}
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Team Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#0f172a', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#b45309',
                          background: '#fffbe6',
                          border: '1px solid #fde68a',
                          padding: '1px 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap'
                        }}>
                          Spent: ₹{t.spent.toLocaleString()}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#047857',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '1px 6px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap'
                        }}>
                          Remaining: ₹{remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions - Compact on Right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => { setEditingId(t.id); setEditingName(t.name); }}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                        title="Edit Team Name"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (canDelete) {
                            setDeletingTeam(t);
                          } else {
                            alert('Cannot delete: team has sold players assigned.');
                          }
                        }}
                        disabled={!canDelete}
                        style={{
                          background: canDelete ? '#fef2f2' : '#f8fafc',
                          color: canDelete ? '#dc2626' : '#94a3b8',
                          border: canDelete ? '1px solid #fecaca' : '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: canDelete ? 'pointer' : 'not-allowed',
                          opacity: canDelete ? 1 : 0.6,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                        title={canDelete ? "Delete Team" : "Cannot delete: team has sold players"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Team Footer */}
        <div style={{ marginTop: 10 }}>
          {teams.length >= 7 ? (
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#64748b',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '6px 10px',
              borderRadius: 8,
              textAlign: 'center'
            }}>
              Maximum team limit reached (7 teams)
            </div>
          ) : (
            <AddTeamInline onAdd={(name) => handleAddInline(name)} />
          )}
        </div>
      </section>

      {/* Delete Team Modal */}
      <ConfirmModal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={() => {
          if (deletingTeam) {
            removeTeam(deletingTeam.id);
            setDeletingTeam(null);
          }
        }}
        title="Delete Team"
        message={`Are you sure you want to delete "${deletingTeam?.name}"?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        icon="🗑️"
        variant="danger"
      />
    </>
  );
};

const AddTeamInline = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();
    const n = name.trim();
    if (!n) return;
    onAdd(n);
    setName("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        style={{
          width: '100%',
          minHeight: 34,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #047857, #065f46)',
          color: '#ffffff',
          border: 'none',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(4, 120, 87, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          transition: 'all 0.2s ease'
        }}
        onClick={() => setOpen(true)}
      >
        ➕ Add team
      </button>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Enter team name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        style={{
          flex: 1,
          minHeight: 34,
          borderRadius: 6,
          border: '1.5px solid #cbd5e1',
          padding: '0 10px',
          fontSize: 12,
          fontWeight: 700,
          outline: 'none'
        }}
      />
      <button
        type="submit"
        disabled={!name.trim()}
        style={{
          minHeight: 34,
          borderRadius: 6,
          background: name.trim() ? '#047857' : '#cbd5e1',
          color: '#ffffff',
          border: 'none',
          padding: '0 12px',
          fontSize: 11,
          fontWeight: 800,
          cursor: name.trim() ? 'pointer' : 'not-allowed'
        }}
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setName(""); }}
        style={{
          minHeight: 34,
          borderRadius: 6,
          background: '#f1f5f9',
          color: '#475569',
          border: '1px solid #cbd5e1',
          padding: '0 10px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        Cancel
      </button>
    </form>
  );
};

export default TeamManager;
