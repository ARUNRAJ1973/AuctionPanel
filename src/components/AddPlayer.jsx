import React, { useRef, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const AddPlayer = () => {
  const { addPlayer } = useAuction();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: "", role: "Batter", basePrice: "", image: "", matches: "", runs: "", wickets: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, image: url }));
    }
  };

  const triggerPick = () => fileRef.current?.click();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addPlayer({
      name: form.name,
      role: form.role,
      basePrice: Number(form.basePrice) || 0,
      image: form.image || undefined,
      stats: {
        matches: Number(form.matches) || 0,
        runs: Number(form.runs) || 0,
        wickets: Number(form.wickets) || 0,
      }
    });
    setForm({ name: "", role: "Batter", basePrice: "", image: "", matches: "", runs: "", wickets: "" });
  };

  return (
    <section className="panel" style={{ marginTop: 12 ,backgroundColor:'#e7dbc6'}}>
      <h2 className="panel__title">Add Player</h2>
      <form className="inline-form add-player-form" onSubmit={onSubmit} style={{ flexWrap: 'wrap', gap: 8 }}>
        <input 
          name="name" 
          value={form.name} 
          onChange={onChange} 
          placeholder="Name" 
          style={{ minHeight: '44px', fontSize: '16px' }}
        />
        <select 
          name="role" 
          value={form.role} 
          onChange={onChange}
          style={{ minHeight: '44px', fontSize: '16px' }}
        >
          <option value="Batter">Batter</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="Wicket-Keeper">Wicket-Keeper</option>
        </select>
        <input 
          name="basePrice" 
          value={form.basePrice} 
          onChange={onChange} 
          placeholder="Base Price (₹)" 
          type="number" 
          min="0"
          style={{ minHeight: '44px', fontSize: '16px' }}
        />
        <input 
          name="matches" 
          value={form.matches} 
          onChange={onChange} 
          placeholder="Matches" 
          type="number" 
          min="0"
          style={{ minHeight: '44px', fontSize: '16px' }}
        />
        <input 
          name="runs" 
          value={form.runs} 
          onChange={onChange} 
          placeholder="Runs" 
          type="number" 
          min="0"
          style={{ minHeight: '44px', fontSize: '16px' }}
        />
        <input 
          name="wickets" 
          value={form.wickets} 
          onChange={onChange} 
          placeholder="Wickets" 
          type="number" 
          min="0"
          style={{ minHeight: '44px', fontSize: '16px' }}
        />
        <input
          name="image"
          value={form.image}
          onClick={triggerPick}
          readOnly
          placeholder="Click to choose image from gallery"
          title="Click to open gallery"
          style={{ minHeight: '44px', fontSize: '16px', cursor: 'pointer' }}
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} style={{ display: 'none' }} />
        <button className="btn primary" type="submit" style={{ minHeight: '44px' ,width:'100%'}}>Add</button>
      </form>
    </section>
  );
};

export default AddPlayer;
