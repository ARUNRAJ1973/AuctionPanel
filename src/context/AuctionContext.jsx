import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { playersApi, teamsApi, auctionApi } from "../services/api";

const AuctionContext = createContext(null);

const MAX_TEAMS = 7;

export const AuctionProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player selection state
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidStep, setBidStep] = useState(5000); // default 5,000

  // Load initial data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Starting data load from API...');
        
        const [playersData, teamsData] = await Promise.all([
          playersApi.getAll(),
          teamsApi.getAll(),
        ]);
        
        console.log('✅ Data loaded successfully:', playersData);
        console.log('✅ Data loaded successfully:', { 
          players: playersData.length, 
          teams: teamsData.length 
        });
        
        setPlayers(playersData);
        setTeams(teamsData);
        setError(null);
      } catch (err) {
        console.error('💥 Error loading data:', err);
        setError(`Failed to load auction data: ${err.message}. Please make sure the database server is running on http://localhost:3001`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle player selection after data loads
  useEffect(() => {
    if (selectedPlayerId && players.length > 0 && !currentBid) {
      const p = players.find(x => Number(x.id) === selectedPlayerId);
      if (p) {
        const bid = p.sold ? p.soldPrice : p.basePrice;
        setCurrentBid(bid);
      }
    }
  }, [players, selectedPlayerId, currentBid]);

  const selectedPlayer = useMemo(
    () => players.find(p => Number(p.id) === selectedPlayerId) || null,
    [players, selectedPlayerId]
  );

  const teamById = useCallback((id) => teams.find(t => Number(t.id) === Number(id)) || null, [teams]);
  const remainingOf = useCallback((teamId) => {
    const t = teamById(teamId);
    return t ? Math.max(0, t.purse - t.spent) : 0;
  }, [teamById]);

  const selectPlayer = useCallback((id) => {
    const playerId = Number(id);
    if (!playerId) return;
    
    // Handle both string and number IDs from database
    const p = players.find(x => Number(x.id) === playerId);
    if (p) {
      // Player found, select immediately
      setSelectedPlayerId(playerId);
      setCurrentBid(p.sold ? p.soldPrice : p.basePrice);
    } else {
      // Player not found yet (data might still be loading)
      // Set the ID anyway, the effect will handle it once data loads
      setSelectedPlayerId(playerId);
      setCurrentBid(null);
    }
  }, [players]);

  const clearSelected = useCallback(() => {
    setSelectedPlayerId(null);
    setCurrentBid(null);
  }, []);

  const incrementBid = useCallback((step) => {
    if (selectedPlayer) {
      const s = step ?? bidStep;
      setCurrentBid(prev => (prev ?? selectedPlayer.basePrice) + s);
    }
  }, [selectedPlayer, bidStep]);

  const decrementBid = useCallback((step) => {
    if (selectedPlayer) {
      const s = step ?? bidStep;
      setCurrentBid(prev => {
        const base = selectedPlayer.basePrice;
        const next = (prev ?? base) - s;
        return next < base ? base : next;
      });
    }
  }, [selectedPlayer, bidStep]);

  const markSold = useCallback(async (teamId) => {
    if (!selectedPlayer || !teamId) return { ok: false, error: "Select player and team" };
    const price = currentBid ?? selectedPlayer.basePrice;
    const team = teams.find(t => Number(t.id) === Number(teamId));
    if (!team) return { ok: false, error: "Team not found" };
    if (price > (team.purse - team.spent)) {
      return { ok: false, error: "Insufficient purse" };
    }
    
    try {
      // Use API to sell player
      const result = await auctionApi.sellPlayer(selectedPlayer.id, teamId, price);
      if (!result.ok) {
        return result;
      }
      
      // Update local state after successful API call
      setPlayers(prev => prev.map(p => Number(p.id) === Number(selectedPlayer.id) ? {
        ...p,
        sold: true,
        soldTo: teamId,
        soldPrice: price,
      } : p));
      
      setTeams(prev => prev.map(t => Number(t.id) === Number(teamId) ? { ...t, spent: t.spent + price } : t));
      
      clearSelected();
      return { ok: true };
    } catch (error) {
      console.error('Error marking player as sold:', error);
      return { ok: false, error: 'Failed to save sale to database' };
    }
  }, [selectedPlayer, currentBid, teams, clearSelected]);

  const addTeam = useCallback(async (name, purse) => {
    if (!name) return;
    if (teams.length >= MAX_TEAMS) return;
    if (teams.some(t => t.name === name)) return;
    
    try {
      const nextId = await auctionApi.getNextTeamId();
      const basePurse = teams[0]?.purse ?? (Number(purse) || 400000);
      const newTeam = { id: nextId, name, purse: basePurse, spent: 0 };
      
      const createdTeam = await teamsApi.create(newTeam);
      setTeams(prev => [...prev, createdTeam]);
    } catch (error) {
      console.error('Error adding team:', error);
    }
  }, [teams]);

  const setAllPurse = useCallback(async (purse) => {
    const val = Math.max(0, Number(purse) || 0);
    try {
      await Promise.all(teams.map(team => teamsApi.setPurse(team.id, val)));
      setTeams(prev => prev.map(t => ({ ...t, purse: val })));
    } catch (error) {
      console.error('Error setting all purses:', error);
    }
  }, [teams]);

  const removeTeam = useCallback(async (id) => {
    // prevent removing if any player already sold to this team
    const hasSold = players.some(p => Number(p.soldTo) === Number(id));
    if (hasSold) {
      alert('Cannot delete team: players have been sold to this team');
      return;
    }
    
    try {
      await teamsApi.delete(id);
      setTeams(prev => prev.filter(t => Number(t.id) !== Number(id)));
    } catch (error) {
      console.error('Error removing team:', error);
      alert('Failed to delete team: ' + error.message);
    }
  }, [players]);

  const renameTeam = useCallback(async (id, name) => {
    const n = (name ?? '').trim();
    if (!n) return;
    
    try {
      await teamsApi.rename(id, n);
      setTeams(prev => prev.map(t => Number(t.id) === Number(id) ? { ...t, name: n } : t));
    } catch (error) {
      console.error('Error renaming team:', error);
      alert('Failed to rename team: ' + error.message);
    }
  }, []);

  const undoSale = useCallback(async (playerId) => {
    const p = players.find(x => Number(x.id) === Number(playerId));
    if (!p || !p.sold || !p.soldTo || !p.soldPrice) return false;
    
    try {
      const result = await auctionApi.undoPlayerSale(playerId, p.soldTo, p.soldPrice);
      if (!result.ok) return false;
      
      // Update local state
      setPlayers(prev => prev.map(x => Number(x.id) === Number(playerId) ? ({ ...x, sold: false, soldTo: null, soldPrice: null }) : x));
      setTeams(prev => prev.map(t => Number(t.id) === Number(p.soldTo) ? { ...t, spent: Math.max(0, t.spent - p.soldPrice) } : t));
      return true;
    } catch (error) {
      console.error('Error undoing sale:', error);
      return false;
    }
  }, [players]);

  const setTeamPurse = useCallback(async (id, purse) => {
    const val = Math.max(0, Number(purse) || 0);
    try {
      await teamsApi.setPurse(id, val);
      setTeams(prev => prev.map(t => Number(t.id) === Number(id) ? { ...t, purse: val } : t));
    } catch (error) {
      console.error('Error setting team purse:', error);
    }
  }, []);

  const addPlayer = useCallback(async (player) => {
    // player: { name, role, basePrice, image, stats }
    try {
      const nextId = await auctionApi.getNextPlayerId();
      const base = Number(player.basePrice) || 0;
      const newPlayer = {
        id: nextId,
        name: player.name?.trim() || `Player ${nextId}`,
        role: player.role || "Batter",
        basePrice: base,
        image: player.image || `https://placehold.co/160x160?text=Player+${nextId}`,
        stats: player.stats || { age: "-", batting: "-", bowling: "-", matches: 0, runs: 0, wickets: 0 },
        sold: false,
        soldTo: null,
        soldPrice: null,
      };
      
      const createdPlayer = await playersApi.create(newPlayer);
      setPlayers(prev => [createdPlayer, ...prev]);
    } catch (error) {
      console.error('Error adding player:', error);
    }
  }, []);

  const updatePlayer = useCallback(async (id, patch) => {
    const player = players.find(p => Number(p.id) === Number(id));
    if (!player) return;
    if (player.sold) {
      alert('Cannot edit sold players');
      return;
    }
    
    try {
      const fields = {};
      if (patch.name != null) fields.name = String(patch.name);
      if (patch.role != null) fields.role = String(patch.role);
      if (patch.basePrice != null) fields.basePrice = Number(patch.basePrice) || 0;
      if (patch.image != null) fields.image = String(patch.image);
      
      let stats = player.stats;
      if (patch.stats) {
        stats = {
          ...player.stats,
          matches: patch.stats.matches != null ? Number(patch.stats.matches) || 0 : player.stats.matches,
          runs: patch.stats.runs != null ? Number(patch.stats.runs) || 0 : player.stats.runs,
          wickets: patch.stats.wickets != null ? Number(patch.stats.wickets) || 0 : player.stats.wickets,
        };
        fields.stats = stats;
      }
      
      await playersApi.update(id, fields);
      setPlayers(prev => prev.map(p => Number(p.id) === Number(id) ? { ...p, ...fields } : p));
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Failed to update player: ' + error.message);
    }
  }, [players]);

  const deletePlayer = useCallback(async (id) => {
    const p = players.find(x => Number(x.id) === Number(id));
    if (!p) return;
    if (p.sold) return; // keep sold records; only allow deleting unsold
    
    try {
      await playersApi.delete(id);
      setPlayers(prev => prev.filter(x => Number(x.id) !== Number(id)));
      if (Number(selectedPlayerId) === Number(id)) clearSelected();
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  }, [players, selectedPlayerId, clearSelected]);

  const value = useMemo(() => ({
    players,
    teams,
    selectedPlayerId,
    selectedPlayer,
    currentBid,
    bidStep,
    loading,
    error,

    // selectors
    teamById,
    remainingOf,

    // actions
    selectPlayer,
    clearSelected,
    incrementBid,
    decrementBid,
    setBidStep,
    markSold,

    addTeam,
    removeTeam,
    setTeamPurse,
    setAllPurse,
    renameTeam,
    undoSale,
    addPlayer,
    updatePlayer,
    deletePlayer,
  }), [players, teams, selectedPlayerId, selectedPlayer, currentBid, bidStep, loading, error, teamById, remainingOf, selectPlayer, clearSelected, incrementBid, decrementBid, setBidStep, markSold, addTeam, removeTeam, setTeamPurse, setAllPurse, renameTeam, undoSale, addPlayer, updatePlayer, deletePlayer]);

  // Show loading state
  if (loading) {
    return (
      <AuctionContext.Provider value={value}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: "#000",
          fontSize: '18px'
        }}>
          Loading auction data...
        </div>
      </AuctionContext.Provider>
    );
  }

  // Show error state
  if (error) {
    return (
      <AuctionContext.Provider value={value}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'var(--danger)',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2>Database Connection Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '14px', marginTop: '20px' }}>
            Please make sure to run: <code>npm run db</code> in a separate terminal
          </p>
        </div>
      </AuctionContext.Provider>
    );
  }

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error("useAuction must be used within AuctionProvider");
  return ctx;
};
