import React, { useRef, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const AddPlayer = () => {
  const { addPlayer } = useAuction();
  const fileRef = useRef(null);
  const [form, setForm] = useState({ name: "", basePrice: "10000", image: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addPlayer({
      name: form.name,
      basePrice: Number(form.basePrice) || 10000,
      image: form.image || undefined,
    });
    setForm({ name: "", basePrice: "10000", image: "" });
  };

  return (
    <section className="panel" style={{
      marginTop: 20,
      background: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: 20,
      padding: 20,
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%'
    }}>
      <h2 style={{
        fontSize: 18,
        fontWeight: 900,
        color: '#0f172a',
        margin: '0 0 14px 0',
        fontStyle: 'italic',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <span>➕</span> Add Player
      </h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', boxSizing: 'border-box' }}>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Player Name"
          style={{
            minHeight: '42px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: 8,
            padding: '0 12px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
        <input
          name="basePrice"
          value={form.basePrice}
          onChange={onChange}
          placeholder="Base Price (₹)"
          type="number"
          min="0"
          style={{
            minHeight: '42px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: 8,
            padding: '0 12px',
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            minHeight: '44px',
            fontSize: '14px',
            fontWeight: 900,
            color: '#fff',
            background: 'linear-gradient(135deg, #047857, #065f46)',
            border: 'none',
            borderRadius: 10,
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
            boxSizing: 'border-box'
          }}
        >
          Add Player
        </button>
      </form>
    </section>
  );
};

export default AddPlayer;
