# ⚽ MatchFlow - Football Analytics Dashboard

A real-time football (soccer) analytics platform that provides live match statistics, predictive insights, and betting predictions powered by advanced match analysis.

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

## 🎯 Features

### Real-Time Match Data
- **Live Match Updates**: Stream live football matches with real-time score, minute, and status updates
- **Match Statistics**: Access comprehensive match stats including:
  - Ball possession
  - Shots and shots on target
  - Passes and passing accuracy
  - Tackles and defensive actions
  - Corners and fouls
  - Yellow/red cards

### Predictive Analytics Engine
- **Smart Predictions**: AI-powered betting predictions with confidence levels
  - BTTS (Both Teams To Score)
  - Over/Under goals
  - Match results
  - Next goal scorer probability
  - Momentum analysis
- **Confidence Scoring**: Weighted confidence calculations based on multiple factors:
  - Shot accuracy and threat assessment
  - Dangerous attacks count
  - Current momentum
  - Possession percentage
  - Historical patterns

### Interactive Dashboard
- **Match Lineup View**: Browse all live and recent matches
- **Match Details Panel**: Detailed analysis for selected matches
- **Statistics Grid**: Visual representation of key match metrics
- **Momentum Indicator**: Real-time momentum tracking for both teams
- **Predictions Panel**: Scrollable predictions with live status updates
- **Event Feed**: Track match events and goal updates

### WebSocket Integration
- **Real-Time Sync**: Live updates pushed via Socket.IO for instant data refresh
- **Bi-directional Communication**: Seamless client-server synchronization
- **Automatic Reconnection**: Handles connection drops gracefully

## 🏗️ Architecture

### Tech Stack
**Backend:**
- Express.js - REST API framework
- TypeScript - Type-safe server code
- Socket.IO - Real-time WebSocket communication
- Axios - HTTP client for external APIs
- Dotenv - Environment configuration

**Frontend:**
- Next.js 16 - React framework with server-side rendering
- React 19 - UI component library
- Tailwind CSS 4 - Utility-first CSS framework
- TypeScript - Type-safe React components

### Project Structure
```
football-analytics/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express server setup
│   │   ├── routes/
│   │   │   └── matchRoutes.ts     # API endpoints
│   │   ├── services/
│   │   │   └── apiFootball.ts     # External API integration
│   │   ├── processors/
│   │   │   └── matchProcessor.ts  # Match data transformation
│   │   ├── jobs/
│   │   │   └── updateMatches.ts   # Periodic match updates
│   │   ├── sockets/
│   │   │   └── socket.ts          # WebSocket configuration
│   │   └── store/
│   │       └── store.ts           # In-memory data store
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout
│   │   │   └── page.tsx           # Home page
│   │   ├── components/
│   │   │   ├── Dashboard.tsx      # Main dashboard layout
│   │   │   ├── MatchList.tsx      # Match listing
│   │   │   ├── Predictions.tsx    # Prediction engine & display
│   │   │   ├── StatsGrid.tsx      # Statistics visualization
│   │   │   ├── MomentumBar.tsx    # Momentum indicator
│   │   │   └── Sidebar.tsx        # Navigation sidebar
│   │   ├── lib/
│   │   │   └── api.ts             # API client & hooks
│   │   └── styles/
│   └── package.json
└── package.json (root monorepo config)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- API-Football API key (get one at [api-sports.io](https://api-sports.io))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd football-analytics
```

2. **Install dependencies**
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

3. **Configure environment variables**

Create a `.env` file in the `backend/` directory:
```env
API_KEY=your_api_football_key_here
PORT=4000
NODE_ENV=development
```

### Running the Application

**Development mode** (runs backend with hot reload):
```bash
npm run dev
```

Or run backend and frontend separately:
```bash
# Terminal 1 - Backend (Express + Socket.IO)
npm run dev:backend

# Terminal 2 - Frontend (Next.js dev server)
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

### Building for Production

```bash
# Build backend (TypeScript compilation)
npm --prefix backend run build

# Build frontend (Next.js optimized build)
npm --prefix frontend run build

# Start production server
npm --prefix frontend start
```

## 📊 API Endpoints

### Matches
- `GET /api/matches` - Fetch all live and recent matches
- `GET /api/matches/live` - Fetch only live matches
- `GET /api/matches/:matchId` - Get detailed match information

### WebSocket Events

**Client → Server:**
- `connect` - Establish WebSocket connection
- `disconnect` - Close connection

**Server → Client:**
- `matches:update` - Broadcast when matches are updated
- `match:live` - New match went live
- `match:end` - Match finished

## 🧠 Prediction Engine

The prediction system analyzes match data to generate intelligent betting insights:

### Confidence Levels
- **Very High**: High signal agreement + strong confidence (≥80%)
- **High**: Strong confidence signals (≥70%)
- **Medium**: Moderate confidence (50-70%)
- **Low**: Weak or conflicting signals (<50%)

### Prediction Types

| Prediction | Description | Trigger |
|-----------|-------------|---------|
| BTTS | Both Teams To Score | Analyzes shots on target and attacking threat |
| Over/Under Goals | Total match goals predictions | Evaluates shooting efficiency and opportunities |
| Match Result | Home/Draw/Away prediction | Weighted score, SOT, momentum, possession |
| Next Goal | Which team scores next | Pressure analysis during even scores |
| Momentum | Current match momentum leader | Real-time performance metrics |

### Weighting System
Each prediction uses a weighted analysis:
- **Score/Goal Difference**: 40%
- **Shots on Target**: 35%
- **Momentum**: 15%
- **Possession**: 10%

## 🔄 Data Flow

1. **Backend** periodically fetches live matches from API-Football
2. **Match Processor** transforms raw API data into application format
3. **Socket.IO** broadcasts updates to connected clients
4. **Frontend** receives real-time updates and refreshes UI
5. **Prediction Engine** analyzes stats and generates insights
6. **Dashboard** visualizes all data in interactive components

## 📈 Key Components

### Dashboard.tsx
Main container component that orchestrates the layout with:
- Left sidebar for match selection
- Central match details panel
- Right prediction panel
- Real-time polling and WebSocket subscriptions

### Predictions.tsx
Advanced prediction engine that:
- Generates multiple concurrent predictions
- Validates market resolution states
- Calculates weighted confidence scores
- Tracks prediction outcomes

### StatsGrid.tsx
Displays match statistics in a grid format:
- Home vs Away comparison
- Visual progress bars for each stat
- Color-coded indicators for dominance

### MomentumBar.tsx
Real-time momentum tracker showing:
- Current momentum value (-100 to +100)
- Visual indicator shifting toward dominant team
- Color intensity based on momentum strength

## 🔐 Environment Configuration

Required environment variables:
```env
API_KEY=<api-sports.io-api-key>
PORT=4000 (optional, defaults to 4000)
NODE_ENV=development|production
```

## 🐛 Debugging

Enable debug logging:
```bash
DEBUG=* npm run dev:backend
```

## 📝 Development Notes

- **TypeScript**: Strict mode enabled for type safety
- **Monorepo**: Root-level npm scripts for convenient development
- **Hot Reload**: Both backend (tsx watch) and frontend (Next.js) support
- **API Fallback**: Automatically falls back to recent matches if no live matches available

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a pull request

## 📄 License

ISC

## 🔗 External Services

- **API-Football**: Live match data, statistics, and league information
  - Endpoint: https://v3.football.api-sports.io
  - Requires: API key from [api-sports.io](https://api-sports.io)

## 📚 Resources

- [API-Football Documentation](https://www.api-football.com/documentation)
- [Express.js](https://expressjs.com/)
- [Next.js](https://nextjs.org/)
- [Socket.IO](https://socket.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎓 Features in Development

- [ ] User authentication and accounts
- [ ] Prediction history tracking
- [ ] Betting slip integration
- [ ] Custom league/team filters
- [ ] Prediction accuracy analytics
- [ ] Mobile-responsive improvements
- [ ] Dark mode theme

---

Made with ⚽ for football analytics enthusiasts
