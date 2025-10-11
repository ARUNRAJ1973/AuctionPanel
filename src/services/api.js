const API_BASE_URL = 'https://auctionjson.onrender.com';

// Robust request helper that tries both string and number ID formats
const requestWithIdFallback = async (basePath, id, options = {}) => {
  // Try with original ID format first
  try {
    return await request(`${basePath}/${id}`, options);
  } catch (error) {
    // If we get a 404, try with the opposite format (string vs number)
    if (error.message.includes('404')) {
      try {
        // If original was a string, try as number; if number, try as string
        const alternativeId = typeof id === 'string' ? Number(id) : String(id);
        // Only retry if the alternative format is actually different
        if (alternativeId != id) { // Using != for loose comparison
          return await request(`${basePath}/${alternativeId}`, options);
        }
      } catch (retryError) {
        // If retry fails, throw the retry error
        throw retryError;
      }
    }
    // If not a 404 or retry didn't help, throw original error
    throw error;
  }
};

// Helper function for making HTTP requests
const request = async (url, options = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${options.method || 'GET'} ${fullUrl} - ${response.status}:`, errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error(`💥 API Request Failed: ${options.method || 'GET'} ${fullUrl}:`, error.message);
    throw error;
  }
};

// Player API methods
export const playersApi = {
  // Get all players
  getAll: () => request('/players'),
  
  // Get a single player by ID
  getById: (id) => requestWithIdFallback('/players', id),
  
  // Create a new player
  create: (player) => request('/players', {
    method: 'POST',
    body: JSON.stringify(player),
  }),
  
  // Update a player
  update: (id, updates) => requestWithIdFallback('/players', id, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  // Delete a player
  delete: (id) => requestWithIdFallback('/players', id, {
    method: 'DELETE',
  }),
  
  // Mark player as sold
  markSold: (id, teamId, price) => requestWithIdFallback('/players', id, {
    method: 'PATCH',
    body: JSON.stringify({
      sold: true,
      soldTo: teamId,
      soldPrice: price,
    }),
  }),
  
  // Undo sale (mark as unsold)
  undoSale: (id) => requestWithIdFallback('/players', id, {
    method: 'PATCH',
    body: JSON.stringify({
      sold: false,
      soldTo: null,
      soldPrice: null,
    }),
  }),
};

// Team API methods
export const teamsApi = {
  // Get all teams
  getAll: () => request('/teams'),
  
  // Get a single team by ID
  getById: (id) => requestWithIdFallback('/teams', id),
  
  // Create a new team
  create: (team) => request('/teams', {
    method: 'POST',
    body: JSON.stringify(team),
  }),
  
  // Update a team
  update: (id, updates) => requestWithIdFallback('/teams', id, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  
  // Delete a team
  delete: (id) => requestWithIdFallback('/teams', id, {
    method: 'DELETE',
  }),
  
  // Update team spending
  updateSpending: (id, spent) => requestWithIdFallback('/teams', id, {
    method: 'PATCH',
    body: JSON.stringify({ spent }),
  }),
  
  // Set team purse
  setPurse: (id, purse) => requestWithIdFallback('/teams', id, {
    method: 'PATCH',
    body: JSON.stringify({ purse }),
  }),
  
  // Rename team
  rename: (id, name) => requestWithIdFallback('/teams', id, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  }),
};

// Combined API methods for complex operations
export const auctionApi = {
  // Complete a player sale (update player and team)
  sellPlayer: async (playerId, teamId, price) => {
    try {
      // Update player as sold
      await playersApi.markSold(playerId, teamId, price);
      
      // Get current team data
      const team = await teamsApi.getById(teamId);
      
      // Update team spending
      await teamsApi.updateSpending(teamId, team.spent + price);
      
      return { ok: true };
    } catch (error) {
      console.error('Error selling player:', error);
      return { ok: false, error: error.message };
    }
  },
  
  // Undo a player sale
  undoPlayerSale: async (playerId, teamId, price) => {
    try {
      // Update player as unsold
      await playersApi.undoSale(playerId);
      
      // Get current team data
      const team = await teamsApi.getById(teamId);
      
      // Update team spending (subtract the price)
      await teamsApi.updateSpending(teamId, Math.max(0, team.spent - price));
      
      return { ok: true };
    } catch (error) {
      console.error('Error undoing player sale:', error);
      return { ok: false, error: error.message };
    }
  },
  
  // Get next available ID for new players (returns string)
  getNextPlayerId: async () => {
    try {
      const players = await playersApi.getAll();
      const nextId = players.length > 0 ? Math.max(...players.map(p => Number(p.id))) + 1 : 1;
      return String(nextId); // Convert to string to match existing IDs
    } catch (error) {
      console.error('Error getting next player ID:', error);
      return "1";
    }
  },
  
  // Get next available ID for new teams (returns string)
  getNextTeamId: async () => {
    try {
      const teams = await teamsApi.getAll();
      const nextId = teams.length > 0 ? Math.max(...teams.map(t => Number(t.id))) + 1 : 1;
      return String(nextId); // Convert to string to match existing IDs
    } catch (error) {
      console.error('Error getting next team ID:', error);
      return "1";
    }
  },
};

export default { playersApi, teamsApi, auctionApi };