# Fortnite IGL System v3.0 - 100% FREE Edition

**Version:** 3.0.0
**Region:** NAC
**Mode:** Builds (Battle Royale)
**Season:** Chapter 7 Season 1 (Pacific Break)

---

## 🆓 NEW IN v3.0: 100% FREE AI COACHING

**Zero API costs. Zero subscriptions. Runs entirely on your PC.**

- **Vision Agent** - Automatic screen reading (no manual input needed!)
- - **Ollama AI** - Local LLM for tactical analysis (no cloud APIs)
  - - **Real-time coaching** - Live callouts in Discord voice
    -
    - ### Cost Comparison
    -
    - | Feature | v2.0 (Old) | v3.0 (New) |
    - |---------|------------|------------|
    - | AI Analysis | Groq API ($10-30/mo) | **Ollama (FREE)** |
    - | Game Data | Manual input | **Vision Agent (auto)** |
    - | Privacy | Data sent to cloud | **100% local** |
    - | Offline | ❌ No | ✅ **Yes** |
    -
    - ---
    -
    - ## 🎯 What's New in v3.0
    -
    - ### 🔬 Vision Agent (Python)
    - Automatically reads your Fortnite screen:
    - - HP & Shield values
      - - Material counts (wood/brick/metal)
        - - Player count
          - - Storm timer
            - - **Surge warnings** (auto-detected!)
              -
              - Performance: <8% CPU, <12% GPU, runs at 3 FPS.
              -
              - ### 🧠 Ollama AI (Local LLM)
              - Free tactical analysis using Llama 3.1:
              - - "Should I fight or rotate?"
                - - "Am I below surge?"
                  - - "What's my priority action?"
                    -
                    - No API keys. No costs. Runs on your GPU.
                    -
                    - ### 🎮 Discord Integration
                    - - Vision Agent → WebSocket → Discord Bot
                      - - Bot calls out warnings in voice channel
                        - - End-game recaps with AI analysis
                          -
                          - ---
                          -
                          - ## ⚠️ Fair Play Statement
                          -
                          - **This tool is NOT cheating.**
                          -
                          - The Vision Agent:
                          - - Only reads pixels from your screen (like your eyes)
                            - - Does NOT inject code into Fortnite
                              - - Does NOT automate gameplay
                                - - Does NOT give unfair advantages
                                  -
                                  - It's the same as having a friend watch your screen and give callouts.
                                  - This complies with Epic Games' terms of service.
                                  -
                                  - ---
                                  -
                                  - ## 🚀 Quick Start
                                  -
                                  - ### Prerequisites
                                  -
                                  - - Windows 10/11
                                    - - Python 3.10+ (for Vision Agent)
                                      - - Node.js 18+ (for Discord Bot)
                                        - - NVIDIA GPU recommended (but not required)
                                          - - Discord account + bot token
                                            -
                                            - ### Installation
                                            -
                                            - ```bash
                                              # Clone the repo
                                              git clone https://github.com/Rahul-sch/fortnite-igl-system.git
                                              cd fortnite-igl-system

                                              # Install Ollama (AI)
                                              # Download from https://ollama.ai/download
                                              ollama pull llama3.1:8b

                                              # Install Vision Agent (Python)
                                              cd vision-agent
                                              pip install -r requirements.txt
                                              python calibrate.py  # Calibrate for your resolution

                                              # Install Discord Bot (Node.js)
                                              cd ../discord-bot
                                              npm install
                                              cp .env.example .env
                                              # Edit .env with your Discord token
                                              ```

                                              ### Running Everything

                                              ```bash
                                              # Terminal 1: Start Ollama
                                              ollama serve

                                              # Terminal 2: Start Discord Bot
                                              cd discord-bot
                                              npm start

                                              # Terminal 3: Start Vision Agent (with Fortnite visible)
                                              cd vision-agent
                                              python main.py

                                              # Terminal 4 (optional): Test Ollama
                                              cd discord-bot
                                              node ollama-client.js
                                              ```

                                              ---

                                              ## 📦 Components

                                              ### 1. Vision Agent (`vision-agent/`)

                                              Python screen reader with:
                                              - **BetterCam** - Fast screen capture (240+ FPS capable)
                                              - - **EasyOCR** - GPU-accelerated text recognition
                                                - - **WebSocket** - Real-time communication with Discord bot
                                                  -
                                                  - Files:
                                                  - ```
                                                    vision-agent/
                                                    ├── main.py              # Main entry point
                                                    ├── calibrate.py         # UI region calibration tool
                                                    ├── config.json          # Configuration
                                                    ├── requirements.txt     # Python dependencies
                                                    └── utils/
                                                        ├── capture.py       # Screen capture module
                                                        ├── ocr.py           # Fortnite-optimized OCR
                                                        └── extractor.py     # Game state extraction
                                                    ```

                                                    See: [docs/VISION_SETUP.md](docs/VISION_SETUP.md)

                                                    ### 2. Discord Bot (`discord-bot/`)

                                                    Node.js bot with:
                                                    - **Voice channel integration** - Joins your duo's call
                                                    - - **Vision Server** - Receives game state from Python agent
                                                      - - **Ollama Client** - Local AI for tactical analysis
                                                        - - **Live tracking** - Slash commands for manual updates
                                                          -
                                                          - Files:
                                                          - ```
                                                            discord-bot/
                                                            ├── bot.js               # Main Discord bot
                                                            ├── vision-server.js     # WebSocket server for Vision Agent
                                                            ├── ollama-client.js     # Local LLM client
                                                            ├── package.json         # Node dependencies
                                                            └── .env.example         # Environment template
                                                            ```

                                                            See: [docs/OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md)

                                                            ### 3. Documentation (`docs/`)

                                                            - **IGL_OS_DOCUMENT.md** - Complete IGL playbook
                                                            - - **ADVANCED_META_STRATEGIES.md** - Storm tanking, scuff plays
                                                              - - **KINCH_ANALYTICS_BENCHMARKS.md** - Pro player stats
                                                                - - **VISION_SETUP.md** - Vision Agent setup guide
                                                                  - - **OLLAMA_SETUP.md** - Local AI setup guide
                                                                    -
                                                                    - ### 4. Data & Tools (`data/`, `tool/`)
                                                                    -
                                                                    - - **poi_dataset.json** - Complete POI data for Chapter 7 Season 1
                                                                      - - **poi_rankings.json** - Scored and ranked POIs
                                                                        - - **scoring_engine.js** - Configurable scoring algorithm
                                                                          - - **index.html** - Web-based situation analyzer (optional)
                                                                            -
                                                                            - ---
                                                                            -
                                                                            - ## 🎮 Discord Commands
                                                                            -
                                                                            - ### With Vision Agent (Automatic)
                                                                            - When Vision Agent is running, the bot automatically:
                                                                            - - Detects surge warnings and alerts you
                                                                              - - Tracks HP/Shield/Mats changes
                                                                                - - Provides tactical callouts based on game state
                                                                                  -
                                                                                  - ### Manual Commands (Fallback)
                                                                                  -
                                                                                  - | Command | Description |
                                                                                  - |---------|-------------|
                                                                                  - | `/igl join` | Join your voice channel |
                                                                                  - | `/igl leave` | Leave and end session |
                                                                                  - | `/igl zone [number] [teams]` | Update zone and teams alive |
                                                                                  - | `/igl surge [status]` | Update surge status |
                                                                                  - | `/igl mats [w] [b] [m]` | Update materials |
                                                                                  - | `/igl fight [result]` | Log a fight result |
                                                                                  - | `/igl gg [placement] [elims]` | End game, get recap |
                                                                                  - | `/igl status` | Get current game status |
                                                                                  -
                                                                                  - ---
                                                                                  -
                                                                                  - ## 🔧 Configuration
                                                                                  -
                                                                                  - ### Vision Agent (`vision-agent/config.json`)
                                                                                  -
                                                                                  - ```json
                                                                                    {
                                                                                      "capture": {
                                                                                        "monitor_index": 0,
                                                                                        "target_fps": 3
                                                                                      },
                                                                                      "ocr": {
                                                                                        "gpu": true
                                                                                      },
                                                                                      "websocket": {
                                                                                        "port": 8765
                                                                                      }
                                                                                    }
                                                                                    ```

                                                                                    ### Discord Bot (`.env`)

                                                                                    ```env
                                                                                    DISCORD_TOKEN=your_bot_token_here
                                                                                    OLLAMA_MODEL=llama3.1:8b
                                                                                    VISION_PORT=8765
                                                                                    ```

                                                                                    ---

                                                                                    ## 🖥️ System Requirements

                                                                                    ### Minimum
                                                                                    - Windows 10
                                                                                    - - 8GB RAM
                                                                                      - - Any GPU (CPU fallback available)
                                                                                        - - Python 3.10+
                                                                                          - - Node.js 18+
                                                                                            -
                                                                                            - ### Recommended
                                                                                            - - Windows 11
                                                                                              - - 16GB RAM
                                                                                                - - NVIDIA RTX 3060+ (8GB VRAM)
                                                                                                  - - Python 3.11+
                                                                                                    - - Node.js 20+
                                                                                                      -
                                                                                                      - ---
                                                                                                      -
                                                                                                      - ## 🏆 Good luck in FNCS 2026!
                                                                                                      -
                                                                                                      - *Built for NAC Duos domination. 100% FREE.*# IGL Winning System - Fortnite Duos Competitive Tool

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

### Option 1: Run the Web Tool Locally

**Using Python (easiest):**
```bash
# Navigate to the tool folder
cd fortnite-igl-system/tool/public

# Start a local server
python3 -m http.server 8080
# OR for Python 2
python -m SimpleHTTPServer 8080

# Open in browser
open http://localhost:8080
```

**Using Node.js:**
```bash
# Install serve globally (one time)
npm install -g serve

# Run the server
cd fortnite-igl-system/tool/public
serve -s . -p 8080

# Open in browser
open http://localhost:8080
```

**Or just open the file directly:**
```bash
# Works in most browsers (Chrome, Firefox, Edge)
open fortnite-igl-system/tool/public/index.html
```

### Option 2: Deploy to Vercel (Share with Teammate)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
cd fortnite-igl-system/tool/public
vercel

# You'll get a URL like: https://your-project.vercel.app
```

### Using the Tool

1. Get a **free Groq API key** from [console.groq.com](https://console.groq.com)
2. Enter your API key in the **Situation Analyzer** tab
3. Fill in your current game situation (landing spot, mats, zone, surge, etc.)
4. Click **"ANALYZE SITUATION"** for AI-powered tactical advice
5. Use **Rotation Planner** tab for visual rotation planning
6. Use **Drop Explorer** to find the best drops for your playstyle

### Setting Up the Discord Bot

```bash
# 1. Navigate to discord-bot folder
cd fortnite-igl-system/discord-bot

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your tokens:
#    DISCORD_TOKEN=your_bot_token
#    DISCORD_CLIENT_ID=your_client_id
#    GROQ_API_KEY=your_groq_key

# 4. Install dependencies
npm install

# 5. Start the bot
npm start
```

**Getting a Discord Bot Token:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Go to Bot → Add Bot → Copy Token
4. Go to OAuth2 → URL Generator
5. Select scopes: `bot`, `applications.commands`
6. Select permissions: `Send Messages`, `Connect`, `Speak`, `Use Slash Commands`
7. Copy URL and invite bot to your server

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
