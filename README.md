# IGL Winning System - Fortnite Duos Competitive Tool

**Version:** 2.0.0
**Region:** NAC
**Mode:** Builds (Battle Royale)
**Season:** Chapter 7 Season 1 (Pacific Break)
**Ping Optimized:** 35-45ms

---

## 🎯 Overview

A complete competitive Fortnite duos system designed to win tournaments through superior rotations, positioning, and decision-making. Built for a duo with elite fighting skills who need to level up their macro game.

### ⚠️ Fair Play Statement

**This tool is NOT cheating.** It uses ONLY manual user inputs - no memory reading, no overlays that extract game data, no automated gameplay. All advice is based on:
- Public map data from fortnite.gg
- Tournament macro principles
- Competitive Fortnite meta analysis
- Pro player statistics from Kinch Analytics

---

## 🚀 What's New in v2.0

- **🤖 Discord Bot** - Voice channel integration for live game tracking
- **🗺️ Rotation Planner** - Interactive map with team predictions and optimal routes
- **📊 Kinch Analytics Benchmarks** - Pro player stats and targets to aim for
- **🔥 Advanced Meta Strategies** - Storm tanking, scuff plays, high ping meta

---

## 📦 Deliverables

### 1. IGL OS Document (`docs/IGL_OS_DOCUMENT.md`)
Complete IGL playbook including:
- One-page cheat sheet for quick reference
- IGL vs Fragger role division
- Tempo control framework (Speed/Slow/Freeze)
- Decision trees for all game phases
- Exact comm scripts (word-for-word)
- High ping adaptation rules (35-45ms)

Sections:
- **A) IGL Rules** - Role division, tempo control, comms protocol
- **B) Early Game** - Off-spawn decision trees, contest protocols
- **C) Midgame Rotations** - Leave timing, deadside creation, surge planning
- **D) Endgame** - Layer selection, tarp patterns, refresh timing
- **E) Drop Cards** - Top 15 POIs for each playstyle

### 2. Discord Bot (`discord-bot/`)

Voice channel integration for live game tracking:
- **Join your call** - Bot joins your duo's voice channel
- **Live tracking** - Update zone, surge, mats, fights via slash commands
- **Real-time insights** - Get tactical advice based on current situation
- **Game recap** - End-of-game analysis with strengths and improvements
- **Dashboard sync** - WebSocket connection for live dashboard updates

Commands: `/igl join` `/igl zone` `/igl surge` `/igl mats` `/igl fight` `/igl gg`

### 3. Advanced Documentation (`docs/`)

**ADVANCED_META_STRATEGIES.md** - The scuff king playbook:
- Storm damage ticks by zone (1/2/5/10 tick breakdowns)
- Campfire math and heal hierarchy for storm tanking
- Scuff resource locations (barrels, trucks, vending machines)
- 200 IQ plays (Dead Man Walking, Surge Sacrifice, Launch Pad Bait)
- High ping specific weapon priority and building adjustments
- Zone prediction patterns for Chapter 7 Season 1

**KINCH_ANALYTICS_BENCHMARKS.md** - Pro player statistics:
- Damage, elim, damage ratio, DPM leaders from FNCS events
- Benchmark targets: Average, Good, Elite, Pro levels
- FNCS 2026 scoring reference
- Self-assessment tracker template

### 4. Map Dataset (`data/`)

**poi_dataset.json** - Complete Chapter 7 Season 1 data:
- 13 Named POIs
- 10+ Landmarks
- Per-location data:
  - Chests, rare chests, ammo boxes
  - Shield sources (slurp barrels, trucks, kegs, vending machines)
  - Materials estimates (wood/brick/metal)
  - Mobility (launch pads, ziplines, vehicles, hot air balloons)
  - Contest data (popularity, typical team count)
  - Rotation data (center distance, deadside potential)
  - Surge potential (tag opportunities, safe angles)

**poi_rankings.json** - Scored and ranked POIs for:
- BALANCED (default) - 30% rotation, 20% loot, 15% shields, 15% mats, 10% surge, 10% safety
- SUPER SAFE - Maximizes low-contest spots
- RISKY/KEYING - Maximizes loot + surge potential

**scoring_engine.js** - Configurable scoring algorithm

### 5. Interactive Tool (`tool/`)

**index.html** - Single-file web application with:

#### Tab 1: Situation Analyzer (Groq-Powered)
Enter your current game situation manually:
- Landing spot
- Teams contested
- Current loadout (weapons, heals, shields)
- Current materials
- Storm pull direction/distance
- Surge status
- Zone/time

Get AI-powered tactical recommendations:
- Leave timing (now/loot 20s/loot 40s)
- Rotation paths A/B/C with risk levels
- Materials refarm plan
- Fight vs refuse decision
- Surge plan with tag spots
- Contingency plans

#### Tab 2: Drop Explorer
- Filter by playstyle (Safe/Balanced/Risky)
- Sort by score, chests, shields, contest risk
- View detailed drop cards
- Links to fortnite.gg for verification

#### Tab 3: Rotation Planner (NEW!)
- Interactive canvas map with click-to-set-position
- Team position predictions based on zone and teams alive
- Optimal rotation routes with multiple path options
- Refarm spots (slurp barrels, wood farms, vehicles)
- Danger zone warnings
- Grid coordinate system (A1-H8)
- Resources layer toggle

#### Tab 4: Map Overlay
- Interactive canvas map
- Toggle layers: POIs, chests, shields, mobility, routes
- Color-coded by contest risk

---

## 🚀 Quick Start

### Using the Interactive Tool

1. Open `tool/public/index.html` in any modern browser
2. Get a free Groq API key from [console.groq.com](https://console.groq.com)
3. Enter your API key in the Situation Analyzer tab
4. Input your current game situation
5. Click "Analyze Situation" for tactical recommendations

### Using the IGL Document

1. Open `docs/IGL_OS_DOCUMENT.md`
2. Print the one-page cheat sheet for quick reference during games
3. Study the decision trees for each game phase
4. Practice the comm scripts with your duo

### Setting Up the Discord Bot

1. Go to `discord-bot/` folder
2. Follow setup instructions in `discord-bot/README.md`
3. Create a Discord bot and get token
4. Configure `.env` with your Discord token and Groq API key
5. Run `npm install && npm start`
6. Use `/igl join` in your server to start tracking

### Running Tests

```bash
cd fortnite-igl-system
node tests/test_scoring.js      # Scoring engine tests
node tests/test_groq_analyzer.js # Analyzer tests
```

---

## 🔧 Technical Details

### Groq API Integration

Uses Groq's OpenAI-compatible API:
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.1-70b-versatile`
- Response format: JSON mode for structured outputs
- Includes retry logic with exponential backoff

### Scoring Algorithm

```javascript
// Balanced preset weights
rotate_potential: 0.30,
loot_quality: 0.20,
shield_availability: 0.15,
materials: 0.15,
surge_potential: 0.10,
contest_risk_inverse: 0.10
```

### Data Sources

| Source | Usage |
|--------|-------|
| [fortnite.gg/map](https://fortnite.gg/map) | Chest/ammo locations, interactive map |
| [TheGamer POI Guide](https://www.thegamer.com/fortnite-chapter-7-season-1-complete-guide-locations-landmarks-where-to-find/) | POI descriptions, landmarks |
| [GameRant Landing Spots](https://gamerant.com/fortnite-chapter-7-season-1-best-landing-spots/) | Competitive viability analysis |
| [FNCS 2026 Format](https://esports.gg/news/fortnite/fortnite-fncs-2026/) | Tournament rules, duos format |
| [Epic Games Patch Notes](https://www.fortnite.com/news) | Season updates, mobility items |
| [Kinch Analytics](https://kinchanalytics.com) | Pro player statistics, FNCS data |

---

## 📁 File Structure

```
fortnite-igl-system/
├── README.md                           # This file
├── docs/
│   ├── IGL_OS_DOCUMENT.md             # Complete IGL playbook
│   ├── ADVANCED_META_STRATEGIES.md    # Storm tanking, scuff plays, high ping meta
│   └── KINCH_ANALYTICS_BENCHMARKS.md  # Pro player stats and benchmarks
├── discord-bot/
│   ├── bot.js                         # Discord bot with voice integration
│   ├── package.json                   # Bot dependencies
│   ├── .env.example                   # Environment template
│   └── README.md                      # Bot setup guide
├── data/
│   ├── poi_dataset.json               # Full POI/landmark data
│   ├── poi_rankings.json              # Scored rankings
│   └── scoring_engine.js              # Scoring algorithm
├── tool/
│   ├── public/
│   │   └── index.html                 # Interactive web tool (4 tabs)
│   └── src/
│       └── groq_analyzer.js           # Groq API integration
└── tests/
    ├── test_scoring.js                # Scoring engine tests
    ├── test_groq_analyzer.js          # Analyzer tests
    ├── test_results.json              # Scoring test results
    └── test_groq_results.json         # Analyzer test results
```

---

## 🎮 Usage Tips

### For IGLs
1. Call zone pulls immediately when zone reveals
2. Use deadside tracking throughout midgame
3. Trust the leave timing rules - early is almost always better
4. Practice the comm scripts until they're automatic

### For Fraggers
1. Trust IGL macro calls even if you see a fight opportunity
2. Focus on enemy tracking during rotations
3. Execute refreshes when IGL approves
4. Be ready to become IGL if teammate goes down

### High Ping Adaptation (35-45ms)
1. Never 50/50 piece control battles
2. Prefire everything - your shots need to leave early
3. Use AR/Sniper at range to neutralize ping disadvantage
4. Let enemies edit first, then react
5. Natural cover > built cover when possible

---

## 🔄 Updating for New Patches

When new patches drop:

1. Check fortnite.gg for map changes
2. Update `poi_dataset.json` with new POI data
3. Run `node data/scoring_engine.js` to regenerate rankings
4. Update mobility items in dataset
5. Run tests to verify integrity

---

## 📊 Test Results

**Scoring Engine Tests:** 18/18 PASS ✅
- Component score functions
- Scoring preset validation
- Dataset integrity
- Ranking generation

**Groq Analyzer Tests:** 19/19 PASS ✅
- Prompt building
- Quick analysis presets
- API structure validation
- Fair play disclaimers

---

## ⚖️ License & Disclaimer

This tool is for educational and training purposes. It does not interact with or modify Fortnite in any way. All data is sourced from publicly available information.

**Not affiliated with Epic Games or Fortnite.**

---

## 🏆 Good luck in FNCS 2026!

*Built for NAC Duos domination.*
