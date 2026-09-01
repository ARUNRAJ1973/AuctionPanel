# 🏏 KPL Auction Panel - Technical Documentation

## 📌 Executive Summary
**KPL Auction Panel** is a real-time, interactive sports player auction management web application built using **React 19**, **React Context API**, and a **RESTful JSON API backend**. It provides dynamic bidding controls, budget/purse tracking across teams, animated player randomizer wheel ("Spinner"), role-based authorization (Admin vs. Viewer), and persistent data storage.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology / Tools |
| :--- | :--- |
| **Frontend Framework** | React 19 (`react`, `react-dom`) |
| **State Management** | React Context API (`AuthContext`, `AuctionContext`) |
| **Routing** | Custom Hash-based Routing (`#/'` & `#/auction/:id`) |
| **Backend & Storage** | REST API / `json-server` (Local `db.json` & Cloud Server `auctionjson.onrender.com`) |
| **User Persistence** | Browser `localStorage` (`kpl_auction_users`, `kpl_auction_current_user`) |
| **Styling & UI** | Pure Vanilla CSS (`App.css`, `Auction.css`) with theme switching (`theme-viewer`) |

---

## 🔑 Authentication & Role-Based Access Control (RBAC)

The application supports 2 distinct user roles:

| Feature / Access | 🛡️ Admin (`admin`) | 👁️ Viewer (`user`) |
| :--- | :---: | :---: |
| **Default Login** | `kpl@gmail.com` / `87654321` | `kpt@gmail.com` / `kpt123` |
| **Spin Player Wheel** | ✅ Yes | ❌ No |
| **Conduct Live Bidding** | ✅ Yes | ❌ No |
| **Mark Player Sold / Undo Sale** | ✅ Yes | ❌ No |
| **Add / Edit / Delete Players** | ✅ Yes | ❌ No |
| **Manage Teams & Purses** | ✅ Yes | ❌ No |
| **View Live Auction & Roster** | ✅ Yes | ✅ Yes (Read-Only) |

---

## 📂 Project Structure Analysis

```
AuctionPanel/
├── db.json                     # Local JSON database for json-server (players, teams)
├── start-servers.sh            # Shell script to boot concurrent mock backend & React app
├── public/                     # Static assets & HTML template
└── src/
    ├── App.js                  # Main Application entry point & Hash router setup
    ├── index.js                # React DOM root render
    ├── App.css                 # Base application styles
    ├── components/             # React visual UI components
    │   ├── AddPlayer.jsx        # Form component to register new auction players
    │   ├── AuctionPanel.jsx     # Live bidding board with increase/decrease bid controls
    │   ├── LoginPage.jsx        # Login & registration authentication screen
    │   ├── LogoutButton.jsx     # Session logout trigger
    │   ├── MobileUserDrawer.jsx # Mobile navigation side drawer for viewer controls
    │   ├── PlayerAuctionSpinner.jsx # Animated roulette vertical spinner for player pick
    │   ├── PlayerCard.jsx       # Card displaying player stats, role, and bid status
    │   ├── PlayerList.jsx       # Grid list of all auction pool players
    │   ├── RoleBasedAccess.jsx  # Route & component guard wrappers (`AdminOnly`, `UserOnly`)
    │   ├── SoldList.jsx         # List of successfully auctioned players with winning teams
    │   ├── StickyTeamBar.jsx    # Footer bar displaying team budgets, spent, and remaining purse
    │   ├── TeamManager.jsx      # Panel for adding teams, editing team names & budget purses
    │   ├── ViewerDashboard.jsx  # Read-only public viewer dashboard for audience
    │   ├── ViewerHeader.jsx     # Public top navigation header for spectators
    │   └── WelcomeScreen.jsx    # Splash welcome screen on app startup
    ├── context/                # Global React State Providers
    │   ├── AuctionContext.jsx   # State management for players, teams, bidding & sales
    │   └── AuthContext.jsx      # State management for auth session & role permission
    ├── data/
    │   └── players.js           # Seed data definitions for initial player roster
    ├── services/
    │   ├── api.js               # HTTP client with ID string/number fallback handling
    │   └── userService.js       # LocalStorage-backed authentication service
    └── styles/
        └── Auction.css          # Custom styling for auction elements, animations & themes
```

---

## ⚡ Key System Workflows

### 1. Data Service Layer & ID Compatibility (`src/services/api.js`)
- Communicates with `https://auctionjson.onrender.com` (or local `json-server`).
- Implements `requestWithIdFallback()`: Handles edge cases where IDs in `db.json` fluctuate between string `"1"` and numeric `1` by attempting fallback queries on HTTP 404.

### 2. Player Randomizer Spinner (`PlayerAuctionSpinner.jsx`)
- Uses `requestAnimationFrame` loop to animate vertical player name ticker.
- Auto-stops after 3 seconds or on manual "Stop Now" trigger to select an unsold player at random.
- Navigates seamlessly to live auction route `#/auction/:id`.

### 3. Auction Engine & Purse Validation (`AuctionContext.jsx`)
- Enforces team purse limits: Checks `currentBid <= (team.purse - team.spent)` before confirming sales.
- Supports Bid Step Adjustments (e.g., ₹5,000 increments).
- Provides transaction safety with **Undo Sale** capability to reverse accidental sales and restore team budgets.

---

## 🚀 Running the Project

### Prerequisites
- Node.js & npm installed.

### Commands
```bash
# Install dependencies
npm install

# Start both local DB server & React dev server
npm run dev

# Or start React application standalone (connects to cloud API)
npm start

# Run test suite
npm test
```
