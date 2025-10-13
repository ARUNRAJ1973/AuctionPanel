import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuction } from "../context/AuctionContext";

const PlayerCard = ({ player, onAuction, onDelete, isSelected }) => {
  const { updatePlayer, undoSale, teamById } = useAuction();
  const { id, name, role, basePrice, image, stats, sold, soldTo, soldPrice } = player;


  console.log("player.....".name);
  console.log("player.....".image);
  
  // Robust image source with fallbacks for common extensions and patterns
  const normalizedName = useMemo(() => String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), [name]);
  const candidateImages = useMemo(() => {
    const base = `/images/${id}`;
    const byName = `/images/${normalizedName}`;
    const compactName = `/images/${String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`; // e.g., "rajsekar"
    const list = [];
    // Prefer explicit image from DB first
    if (image) list.push(image);
    // Try common extensions by id
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(base + ext));
    // Try by normalized name (dashes)
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(byName + ext));
    // Try compact name (no separators), to support files like rajsekar.jpeg
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(compactName + ext));
    // Final placeholder
    list.push(`https://placehold.co/160x160?text=${encodeURIComponent(name || 'Player')}`);
    // De-duplicate
    return [...new Set(list)];
  }, [id, image, normalizedName, name]);

  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = candidateImages[Math.min(imgIndex, candidateImages.length - 1)];

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name,
    role,
    basePrice,
    matches: stats.matches,
    runs: stats.runs,
    wickets: stats.wickets,
    image,
  });
  const fileRef = useRef(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, image: url }));
      setImgIndex(0); // reset to new chosen image
    }
  };

  // If DB image changes (e.g., after update), reset index
  useEffect(() => {
    setImgIndex(0);
  }, [image]);

  const onImgError = () => {
    setImgIndex((i) => Math.min(i + 1, candidateImages.length - 1));
  };

  const onSave = () => {
    updatePlayer(id, {
      name: form.name,
      role: form.role,
      basePrice: Number(form.basePrice) || 0,
      image: form.image,
      stats: {
        matches: Number(form.matches) || 0,
        runs: Number(form.runs) || 0,
        wickets: Number(form.wickets) || 0,
      }
    });
    setEditing(false);
  };

  return (
    <div className={`player-card ${isSelected ? "selected" : ""}`}>
      <div className="player-card__imgwrap">
        <img src={candidateImages[0]} alt={name} />
        {/* <img src={form.image || imgSrc} onError={onImgError} alt={name} /> */}
        {sold && <span className="badge badge--sold">SOLD</span>}
      </div>
      <div className="player-card__body">
        {editing ? (
          <div className="player-card__edit">
            {/* Name and Role Row */}
            <div className="player-card__row">
              <input 
                name="name" 
                value={form.name} 
                onChange={onChange} 
                placeholder="Player Name" 
                title="Player Name"
              />
              <select name="role" value={form.role} onChange={onChange} title="Player Role">
                <option value="Batter">Batter</option>
                <option value="Bowler">Bowler</option>
                <option value="All-Rounder">All-Rounder</option>
                <option value="Wicket-Keeper">Wicket-Keeper</option>
              </select>
            </div>
            
            {/* Base Price Row */}
            <div className="player-card__row">
              <input 
                name="basePrice" 
                type="number" 
                min="0" 
                value={form.basePrice} 
                onChange={onChange} 
                placeholder="Base Price (₹)" 
                title="Base Price in Rupees"
              />
            </div>
            
            {/* Stats Row */}
            <div className="player-card__row">
              <input 
                name="matches" 
                type="number" 
                min="0" 
                value={form.matches} 
                onChange={onChange} 
                placeholder="Matches" 
                title="Total Matches"
              />
              <input 
                name="runs" 
                type="number" 
                min="0" 
                value={form.runs} 
                onChange={onChange} 
                placeholder="Runs" 
                title="Total Runs"
              />
              <input 
                name="wickets" 
                type="number" 
                min="0" 
                value={form.wickets} 
                onChange={onChange} 
                placeholder="Wickets" 
                title="Total Wickets"
              />
            </div>
            
            {/* Image Row */}
            <div className="player-card__row player-card__image-row">
              <input 
                name="image" 
                value={form.image} 
                onClick={() => fileRef.current?.click()} 
                readOnly 
                placeholder="Click to choose image" 
                title="Click to upload new image"
                style={{ cursor: 'pointer' }}
              />
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/*" 
                onChange={onPickImage} 
                style={{ display: 'none' }} 
              />
            </div>
            
            {/* Action Buttons */}
            <div className="player-card__actions" style={{justifyContent:'space-evenly', paddingTop: 10, gap: '8px'}}>
              <button className="btn small primary"
               onClick={onSave} style={{ minHeight: '40px', flex: '1',backgroundColor:'#05552ad2',fontWeight:'bold',color:'#fff' }}>Save</button>
              <button 
                className="btn small ghost" 
                style={{backgroundColor:'#550505d2',fontWeight:'bold',color:'#fff', minHeight: '40px', flex: '1'}} 
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="player-card__row">
              <div className="player-card__name">{name}</div>
              <div className="player-card__role">{role}</div>
            </div>
            <div className="base-price" style={{color:"#000000",backgroundColor:'#fffae4ff ',border:'1px solid #6d6d6dff',fontWeight:'bold',borderRadius:8,textAlign:'center',paddingTop:5,paddingBottom:5}}>
              <span>Base: ₹{basePrice.toLocaleString()}</span>
            </div>
            {sold ? (
                <div className="player-card__sold">
                  <div className="player-card__sold-info">
                    <div className="player-card__sold-amount">Sold: ₹{soldPrice.toLocaleString()}</div>
                    <div className="player-card__sold-team">to {teamById(soldTo)?.name || soldTo}</div>
                  </div>
                  <button 
                    className="btn small outline player-card__undo-btn" 
                    // onClick={async () => {
                    //   const success = await undoSale(id);
                    //   if (!success) {
                    //     alert('Failed to undo sale');
                    //   }
                    // }}
                    onClick={async () => {
                    const confirmUndo = window.confirm('Are you sure you want to undo this sale?');
                    if (!confirmUndo) return; // If user cancels, do nothing

                    const success = await undoSale(id);
                    if (!success) {
                      alert('Failed to undo sale');
                    }
                  }}

                    title="Undo this sale"
                    style={{ minHeight: '40px',backgroundColor:'#b34747' }}
                  >
                    Undo Sale
                  </button>
                </div>
            ) : (
              <div className="player-card__actions player-card__main-actions" style={{justifyContent:'space-evenly', gap: '4px'}}>
                <button className="btn small success" onClick={() => onAuction(id)} style={{ minHeight: '40px', flex: '1',backgroundColor:'#c7c7c7ff',color:'#000',fontWeight:'bold' }}>Auction</button>
                <button className="btn small" style={{backgroundColor:'#b7c1b8da',border:'1px solid #ebe8e8ff', minHeight: '40px', flex: '1',color:'#000000ff',fontWeight:'bold'}} onClick={() => setEditing(true)}>Edit</button>
                <button className="btn small danger outline" 
                onClick={() => {
                if (window.confirm('Are you sure you want to delete this Player?')) {
                  onDelete(id);
                }
              }}
                style={{ minHeight: '40px', flex: '1',backgroundColor:'#b34747',fontWeight:'bold' }}>Delete</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;
