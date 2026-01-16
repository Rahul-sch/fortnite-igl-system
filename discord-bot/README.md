# 🤖 IGL Discord Bot

**Voice call integration for live game tracking and AI-powered insights**

---

## 🎮 Features

- **Join Voice Channel** - Bot joins your duo's call during games
- **Live Game Tracking** - Update zone, surge, mats, fights in real-time
- **Instant Insights** - Get tactical advice based on your current situation
- **Game Recap** - End-of-game analysis with what went well and what to improve
- **Dashboard Sync** - WebSocket connection to update the web dashboard live

---

## 🚀 Setup

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" → Name it "IGL Bot"
3. Go to "Bot" tab → Click "Add Bot"
4. Enable these Privileged Gateway Intents:
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT
5. Copy the BOT TOKEN

### 2. Invite Bot to Server

1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - Send Messages
   - Embed Links
   - Connect (voice)
   - Speak (voice)
   - Use Slash Commands
4. Copy the generated URL and open it to invite the bot

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DISCORD_TOKEN=your_bot_token_here
GROQ_API_KEY=your_groq_key_here
PORT=3001
```

### 4. Install & Run

```bash
npm install
npm start
```

---

## 📝 Commands

| Command | Description |
|---------|-------------|
| `/igl join` | Join your voice channel, start session |
| `/igl zone [number] [teams]` | Update zone and teams alive |
| `/igl surge [status]` | Update surge position |
| `/igl mats [wood] [brick] [metal]` | Update materials |
| `/igl fight [result]` | Log a fight outcome |
| `/igl position [grid] [zonecenter]` | Update map position |
| `/igl status` | Get current status + insights |
| `/igl gg [placement] [elims]` | End game, get full recap |
| `/igl leave` | Disconnect bot |

---

## 💡 Example Session

```
You: /igl join
Bot: 🎮 IGL Bot Joined! Connected to Duo Voice. Session started!

You: /igl zone 3 28
Bot: 🌀 Zone 3 | 28 Teams
     🎯 Midgame - rotate now if zone is far, hit surge if needed

You: /igl surge behind_5
Bot: ⚡ Surge: ⚠️ Need Tags
     Need damage - AR peek for tags, consider pushing weak teams

You: /igl mats 450 200 100
Bot: 🪵 Mats: 750
     👍 Decent - keep farming when possible

You: /igl fight won_elim
Bot: ⚔️ Fight: ✅ Won fight - got the elim!
     Total Elims: 1

You: /igl gg 5 3
Bot: 🏆 Game Recap - #5
     Duration: 22 minutes | 3 Elims
     Points: Placement 12 + Elims 6 = Total: 18

     ✅ What Went Well:
     • Excellent late-game positioning

     📈 To Improve:
     • Surge management - try to get early tags
```

---

## 🔗 Dashboard Integration

The bot emits WebSocket events that the web dashboard can receive:

```javascript
// In your dashboard
const socket = io('http://localhost:3001');

socket.on('state_update', (data) => {
  // Update dashboard with live game state
  console.log(data.state);
});

socket.on('fight_event', (data) => {
  // Show fight notification
});

socket.on('game_end', (data) => {
  // Show game recap
});
```

---

## ⚠️ Fair Play Notice

This bot uses **ONLY manual user inputs** via Discord commands. It does not:
- Read game memory
- Use any overlays
- Automate any gameplay
- Extract data from the game

All insights are based on the information YOU provide and public competitive meta knowledge.

---

## 🏆 Good luck in FNCS!
