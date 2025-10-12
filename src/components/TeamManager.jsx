import React, { useMemo, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const TeamManager = () => {
  const { teams, addTeam, removeTeam, setAllPurse, renameTeam, players } = useAuction();
  const [teamName, setTeamName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

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
    <section className="panel" style={{backgroundColor:'#e7dbc6'}}>
      <div className="panel__header-row team-manager-header" style={{marginBottom: 12}}>
        <h2 className="panel__title">Teams owners</h2>
        <div className="col team-purse-input" style={{ alignItems: 'flex-end' }}>
          <label className="muted" style={{marginBottom: 4}}>Global Purse (₹)</label>
          <input
            type="number"
            min="0"
            value={teams[0]?.purse ?? 400000}
            onChange={(e) => setAllPurse(e.target.value)}
            placeholder="Global purse"
            title="Set purse for all teams"
            style={{ minHeight: '44px', fontSize: '16px' }}
          />
        </div>
      </div>

      <ul className="list">
        {teams.map((t) => {
          const count = teamSoldCount[t.id] || 0;
          const canDelete = count === 0;
          const remaining = Math.max(0, t.purse - t.spent);
          return (
            <li key={t.id} className={`list__item team-item ${editingId === t.id ? 'team-editing' : 'list__item--space-between'}`}>
              {editingId === t.id ? (
                <div className="team-edit-form">
                  <input 
                    className="team-edit-input" 
                    value={editingName} 
                    onChange={(e) => setEditingName(e.target.value)} 
                    placeholder="Team name" 
                    autoFocus
                  />
                  <div className="team-edit-buttons">
                    <button 
                      className="btn primary" 
                      onClick={() => { renameTeam(t.id, editingName); setEditingId(null); }}
                      disabled={!editingName.trim()}
                    style={{backgroundColor:'#fffcdb',border:'1px solid #f0e65b'}}
                    >
                      Save
                    </button>
                    <button 
                      className="btn ghost" 
                      style={{backgroundColor:'#f0e65b'}}
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn danger outline"
                      onClick={() => canDelete && removeTeam(t.id) && setEditingId(null)}
                      disabled={!canDelete}
                      title={canDelete ? "Delete team" : "Cannot delete: team has sold players"}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="team-info" style={{display:'flex',flexDirection:'column'}}>
                    <strong>{t.name}</strong>
                    <div className="muted" style={{fontSize:15 , fontWeight:'bold'}}> • Spent ₹{t.spent.toLocaleString()}</div>
                    <div className="muted" style={{fontSize:15 , fontWeight:'bold'}}> • Remaining ₹{remaining.toLocaleString()}</div>
                  </div>
                  <div className="inline-form team-actions">
                    <button className="btn" style={{backgroundColor:'#f0e65b', minHeight: '44px',fontWeight:'bold',color:'#000'}}  onClick={() => { setEditingId(t.id); setEditingName(t.name); }}>Edit</button>
                    <button
                      className="btn danger outline"
                      onClick={() => canDelete && removeTeam(t.id)}
                      disabled={!canDelete}
                      title={canDelete ? "Remove team" : "Cannot remove: team has sold players"}
                      style={{minHeight: '44px',fontWeight:'bold'}}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <div className="add-team-footer">
{teams.length >= 7 ? (
<button className="btn" disabled title="Team limit reached (7)">Add team</button>
        ) : (
          <AddTeamInline onAdd={(name) => handleAddInline(name)} />
        )}
      </div>
    </section>
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
    return <button className="btn primary" onClick={() => setOpen(true)}>Add team</button>;
  }
  return (
    <form className="inline-form add-team-form" onSubmit={submit}>
      <input
        type="text"
        placeholder="Team name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ minHeight: '44px', fontSize: '16px' }}
      />
      <button className="btn primary" type="submit" style={{ minHeight: '44px' }}>Add</button>
      <button className="btn ghost" style={{backgroundColor:'#405167', minHeight: '44px'}} type="button" onClick={() => { setOpen(false); setName(""); }}>Cancel</button>
    </form>
  );
};

export default TeamManager;
