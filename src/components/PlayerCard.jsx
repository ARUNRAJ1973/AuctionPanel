import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuction } from "../context/AuctionContext";
import ConfirmModal from "./ConfirmModal";

const PlayerCard = ({ player, onAuction, onDelete, isSelected }) => {
  const { updatePlayer, undoSale, teamById } = useAuction();
  const { id, name, basePrice, image, sold, soldTo, soldPrice } = player;

  const [showUndoModal, setShowUndoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Robust image source with fallbacks for common extensions and patterns
  const normalizedName = useMemo(() => String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), [name]);
  const candidateImages = useMemo(() => {
    const base = `/images/${id}`;
    const byName = `/images/${normalizedName}`;
    const compactName = `/images/${String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '')}`;
    const list = [];
    if (image) list.push(image);
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(base + ext));
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(byName + ext));
    [".jpg", ".jpeg", ".png", ".webp"].forEach(ext => list.push(compactName + ext));
    list.push(`https://placehold.co/160x160?text=${encodeURIComponent(name || 'Player')}`);
    return [...new Set(list)];
  }, [id, image, normalizedName, name]);

  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = candidateImages[Math.min(imgIndex, candidateImages.length - 1)];

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name,
    basePrice: basePrice || 10000,
    image,
  });
  const fileRef = useRef(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, image: url }));
      setImgIndex(0);
    }
  };

  useEffect(() => {
    setImgIndex(0);
  }, [image]);

  const onImgError = () => {
    setImgIndex((i) => Math.min(i + 1, candidateImages.length - 1));
  };

  const onSave = () => {
    updatePlayer(id, {
      name: form.name,
      basePrice: Number(form.basePrice) || 10000,
      image: form.image,
    });
    setEditing(false);
  };

  const handleConfirmUndo = async () => {
    const success = await undoSale(id);
    if (!success) {
      alert('Failed to undo sale');
    }
  };

  const handleConfirmDelete = () => {
    onDelete(id);
  };

  return (
    <>
      <div className={`player-card ${isSelected ? "selected" : ""}`}>
        <div className="player-card__imgwrap">
          <img src={imgSrc} onError={onImgError} alt={name} />
          {sold && (
            <span className="badge badge--sold" title={`Sold to ${teamById(soldTo)?.name || soldTo}`}>
              SOLD TO {teamById(soldTo)?.name ? teamById(soldTo).name.toUpperCase() : String(soldTo).toUpperCase()}
            </span>
          )}
        </div>
        <div className="player-card__body">
          {editing ? (
            <div className="player-card__edit">
              <div className="player-card__row">
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={onChange} 
                  placeholder="Player Name" 
                  title="Player Name"
                />
              </div>
              
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
                <div className="player-card__name" title={name}>{name}</div>
                <div className="baseprice" title={`Base Price: ₹${basePrice ? Number(basePrice).toLocaleString() : "10,000"}`}>
                  ₹{basePrice ? Number(basePrice).toLocaleString() : "10,000"}
                </div>
              </div>
              {sold ? (
                <div className="player-card__sold">
                  <div className="player-card__sold-amount">
                    Sold: ₹{soldPrice ? Number(soldPrice).toLocaleString() : '10,000'}
                  </div>
                  <button 
                    className="btn player-card__undo-btn" 
                    onClick={() => setShowUndoModal(true)}
                    title="Undo this sale"
                    type="button"
                  >
                    Undo Sale
                  </button>
                </div>
              ) : (
                <div className="player-card__actions player-card__main-actions" style={{justifyContent:'space-evenly', gap: '4px'}}>
                  <button className="playerauction" onClick={() => onAuction(id)} type="button">Auction</button>
                  <button className="playeredit" onClick={() => setEditing(true)} type="button">Edit</button>
                  <button 
                    className="playerdelete" 
                    onClick={() => setShowDeleteModal(true)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for Undo Sale */}
      <ConfirmModal
        isOpen={showUndoModal}
        onClose={() => setShowUndoModal(false)}
        onConfirm={handleConfirmUndo}
        title="Undo Player Sale"
        message={`Are you sure you want to undo the sale for "${name}"?`}
        confirmText="Undo Sale"
        cancelText="Cancel"
        icon="🔄"
        variant="warning"
      />

      {/* Modal for Delete Player */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Player"
        message={`Are you sure you want to delete player "${name}"?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        icon="🗑️"
        variant="danger"
      />
    </>
  );
};

export default PlayerCard;
