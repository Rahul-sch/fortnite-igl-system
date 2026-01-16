/**
 * IGL Discord Bot - Voice Call Integration
 *
 * Features:
 * - Joins voice channel and tracks game sessions
 * - Receives live game data via commands
 * - Provides real-time tactical insights
 * - Generates end-of-game recap with analysis
 *
 * NOT CHEATING: Uses only manual user inputs via Discord commands
 */

require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  VoiceConnectionStatus,
  entersState,
  getVoiceConnection
} = require('@discordjs/voice');

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Express server for WebSocket to dashboard
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Game session storage
const gameSessions = new Map();

// Game session class
class GameSession {
  constructor(guildId, channelId, players) {
    this.guildId = guildId;
    this.channelId = channelId;
    this.players = players;
    this.startTime = Date.now();
    this.events = [];
    this.currentState = {
      zone: 1,
      teamsAlive: 50,
      placement: null,
      eliminations: 0,
      surgeStatus: 'even',
      mats: { wood: 0, brick: 0, metal: 0 },
      position: null,
      zoneCenter: null
    };
    this.insights = [];
    this.warnings = [];
  }

  addEvent(type, data) {
    const event = {
      timestamp: Date.now() - this.startTime,
      type,
      data
    };
    this.events.push(event);
    return event;
  }

  updateState(newState) {
    Object.assign(this.currentState, newState);
    this.analyzeState();
  }

  analyzeState() {
    const state = this.currentState;
    this.warnings = [];
    this.insights = [];

    // Surge warnings
    if (state.surgeStatus === 'behind_10+') {
      this.warnings.push('🚨 CRITICAL SURGE - Must get tags NOW!');
    } else if (state.surgeStatus === 'behind_5') {
      this.warnings.push('⚠️ Below surge - look for safe tags');
    }

    // Mat warnings
    const totalMats = state.mats.wood + state.mats.brick + state.mats.metal;
    if (totalMats < 300 && state.zone >= 4) {
      this.warnings.push('⚠️ Low mats for endgame - refarm priority!');
    }

    // Zone insights
    if (state.zone >= 5 && state.placement > 15) {
      this.insights.push('💡 Moving zones - stay on edge, dont overcommit');
    }

    // Position insights
    if (state.teamsAlive <= 10) {
      this.insights.push('💡 Final circles - every decision matters');
    }
  }

  generateRecap() {
    const duration = Math.round((Date.now() - this.startTime) / 1000 / 60);
    const state = this.currentState;

    return {
      duration: `${duration} minutes`,
      placement: state.placement || 'Unknown',
      eliminations: state.eliminations,
      events: this.events,
      analysis: this.analyzePerformance()
    };
  }

  analyzePerformance() {
    const state = this.currentState;
    const analysis = {
      strengths: [],
      improvements: [],
      keyMoments: []
    };

    // Analyze based on final results
    if (state.placement <= 5) {
      analysis.strengths.push('Excellent late-game positioning');
    }
    if (state.eliminations >= 5) {
      analysis.strengths.push('Strong fragging performance');
    }

    // Look for improvement areas
    const surgeEvents = this.events.filter(e => e.type === 'surge_update');
    const belowSurgeCount = surgeEvents.filter(e =>
      e.data.status.includes('behind')
    ).length;

    if (belowSurgeCount >= 3) {
      analysis.improvements.push('Surge management - try to get early tags');
    }

    // Key moments
    const fightEvents = this.events.filter(e => e.type === 'fight');
    analysis.keyMoments = fightEvents.slice(-3).map(e => ({
      time: Math.round(e.timestamp / 1000 / 60) + ' min',
      description: e.data.description
    }));

    return analysis;
  }
}

// Slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('igl')
    .setDescription('IGL Bot commands')
    .addSubcommand(sub =>
      sub.setName('join')
        .setDescription('Join your voice channel and start a game session')
    )
    .addSubcommand(sub =>
      sub.setName('leave')
        .setDescription('Leave voice channel and end session')
    )
    .addSubcommand(sub =>
      sub.setName('zone')
        .setDescription('Update current zone')
        .addIntegerOption(opt =>
          opt.setName('number')
            .setDescription('Zone number (1-9)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(9)
        )
        .addIntegerOption(opt =>
          opt.setName('teams')
            .setDescription('Teams alive')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('surge')
        .setDescription('Update surge status')
        .addStringOption(opt =>
          opt.setName('status')
            .setDescription('Surge status')
            .setRequired(true)
            .addChoices(
              { name: '10+ Above (Safe)', value: 'ahead_10+' },
              { name: '5-10 Above', value: 'ahead_5' },
              { name: 'Even', value: 'even' },
              { name: '5-10 Below', value: 'behind_5' },
              { name: '10+ Below (CRITICAL)', value: 'behind_10+' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('mats')
        .setDescription('Update materials')
        .addIntegerOption(opt =>
          opt.setName('wood').setDescription('Wood count').setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('brick').setDescription('Brick count').setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('metal').setDescription('Metal count').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('fight')
        .setDescription('Log a fight')
        .addStringOption(opt =>
          opt.setName('result')
            .setDescription('Fight result')
            .setRequired(true)
            .addChoices(
              { name: 'Won - Got elim', value: 'won_elim' },
              { name: 'Won - They ran', value: 'won_disengage' },
              { name: 'Lost - Wiped', value: 'lost_wipe' },
              { name: 'Lost - One down', value: 'lost_knock' },
              { name: 'Trade - Both hurt', value: 'trade' },
              { name: 'Avoided - Refused', value: 'avoided' }
            )
        )
    )
    .addSubcommand(sub =>
      sub.setName('position')
        .setDescription('Update position on map')
        .addStringOption(opt =>
          opt.setName('grid')
            .setDescription('Grid position (e.g., D5)')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('zonecenter')
            .setDescription('Zone center grid (e.g., E4)')
            .setRequired(false)
        )
    )
    .addSubcommand(sub =>
      sub.setName('gg')
        .setDescription('End game and get recap')
        .addIntegerOption(opt =>
          opt.setName('placement')
            .setDescription('Final placement')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt.setName('elims')
            .setDescription('Total eliminations')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('status')
        .setDescription('Get current game status and insights')
    ),
];

// Register commands on ready
client.once('ready', async () => {
  console.log(`🎮 IGL Bot logged in as ${client.user.tag}`);

  try {
    await client.application.commands.set(commands);
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

// Handle interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'igl') return;

  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  try {
    switch (subcommand) {
      case 'join':
        await handleJoin(interaction);
        break;
      case 'leave':
        await handleLeave(interaction);
        break;
      case 'zone':
        await handleZoneUpdate(interaction);
        break;
      case 'surge':
        await handleSurgeUpdate(interaction);
        break;
      case 'mats':
        await handleMatsUpdate(interaction);
        break;
      case 'fight':
        await handleFight(interaction);
        break;
      case 'position':
        await handlePosition(interaction);
        break;
      case 'gg':
        await handleGameEnd(interaction);
        break;
      case 'status':
        await handleStatus(interaction);
        break;
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.reply({
      content: '❌ An error occurred. Please try again.',
      ephemeral: true
    });
  }
});

// Command handlers
async function handleJoin(interaction) {
  const member = interaction.member;
  const voiceChannel = member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You need to be in a voice channel first!',
      ephemeral: true
    });
  }

  // Join voice channel
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
    selfDeaf: false,
    selfMute: true
  });

  // Create game session
  const session = new GameSession(
    interaction.guildId,
    voiceChannel.id,
    voiceChannel.members.map(m => m.user.username)
  );
  gameSessions.set(interaction.guildId, session);

  // Emit to dashboard
  io.emit('session_start', {
    guildId: interaction.guildId,
    players: session.players,
    startTime: session.startTime
  });

  const embed = new EmbedBuilder()
    .setColor(0x6366f1)
    .setTitle('🎮 IGL Bot Joined!')
    .setDescription(`Connected to **${voiceChannel.name}**\nGame session started!`)
    .addFields(
      { name: 'Players', value: session.players.join(', '), inline: true },
      { name: 'Commands', value: '`/igl zone` `/igl surge` `/igl mats` `/igl fight` `/igl gg`', inline: false }
    )
    .setFooter({ text: 'Use /igl status anytime for insights' });

  await interaction.reply({ embeds: [embed] });
}

async function handleLeave(interaction) {
  const connection = getVoiceConnection(interaction.guildId);
  if (connection) {
    connection.destroy();
  }
  gameSessions.delete(interaction.guildId);

  await interaction.reply('👋 IGL Bot disconnected. GG!');
}

async function handleZoneUpdate(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session. Use `/igl join` first!', ephemeral: true });
  }

  const zone = interaction.options.getInteger('number');
  const teams = interaction.options.getInteger('teams');

  session.updateState({ zone, teamsAlive: teams });
  session.addEvent('zone_update', { zone, teams });

  // Emit to dashboard
  io.emit('state_update', { guildId: interaction.guildId, state: session.currentState });

  const embed = new EmbedBuilder()
    .setColor(0x06b6d4)
    .setTitle(`🌀 Zone ${zone} | ${teams} Teams`)
    .setDescription(getZoneAdvice(zone, teams));

  if (session.warnings.length > 0) {
    embed.addFields({ name: '⚠️ Warnings', value: session.warnings.join('\n') });
  }
  if (session.insights.length > 0) {
    embed.addFields({ name: '💡 Insights', value: session.insights.join('\n') });
  }

  await interaction.reply({ embeds: [embed] });
}

async function handleSurgeUpdate(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const status = interaction.options.getString('status');
  session.updateState({ surgeStatus: status });
  session.addEvent('surge_update', { status });

  io.emit('state_update', { guildId: interaction.guildId, state: session.currentState });

  const statusEmojis = {
    'ahead_10+': '✅ SAFE',
    'ahead_5': '👍 Comfortable',
    'even': '➡️ Even',
    'behind_5': '⚠️ Need Tags',
    'behind_10+': '🚨 CRITICAL'
  };

  const embed = new EmbedBuilder()
    .setColor(status.includes('behind') ? 0xef4444 : 0x10b981)
    .setTitle(`⚡ Surge: ${statusEmojis[status]}`)
    .setDescription(getSurgeAdvice(status));

  await interaction.reply({ embeds: [embed] });
}

async function handleMatsUpdate(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const wood = interaction.options.getInteger('wood');
  const brick = interaction.options.getInteger('brick');
  const metal = interaction.options.getInteger('metal');
  const total = wood + brick + metal;

  session.updateState({ mats: { wood, brick, metal } });
  session.addEvent('mats_update', { wood, brick, metal, total });

  io.emit('state_update', { guildId: interaction.guildId, state: session.currentState });

  const embed = new EmbedBuilder()
    .setColor(total < 500 ? 0xf59e0b : 0x10b981)
    .setTitle(`🪵 Mats: ${total}`)
    .addFields(
      { name: '🪵 Wood', value: `${wood}`, inline: true },
      { name: '🧱 Brick', value: `${brick}`, inline: true },
      { name: '⚙️ Metal', value: `${metal}`, inline: true }
    )
    .setDescription(getMatsAdvice(total, session.currentState.zone));

  await interaction.reply({ embeds: [embed] });
}

async function handleFight(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const result = interaction.options.getString('result');

  const resultDescriptions = {
    'won_elim': '✅ Won fight - got the elim!',
    'won_disengage': '✅ Won fight - they disengaged',
    'lost_wipe': '❌ Lost fight - team wiped',
    'lost_knock': '⚠️ Lost fight - one knocked',
    'trade': '🔄 Trade - both teams hurt',
    'avoided': '🛡️ Avoided fight - smart play'
  };

  if (result === 'won_elim') {
    session.currentState.eliminations++;
  }

  session.addEvent('fight', {
    result,
    description: resultDescriptions[result],
    zone: session.currentState.zone
  });

  io.emit('fight_event', {
    guildId: interaction.guildId,
    result,
    elims: session.currentState.eliminations
  });

  const embed = new EmbedBuilder()
    .setColor(result.includes('won') ? 0x10b981 : result.includes('lost') ? 0xef4444 : 0xf59e0b)
    .setTitle(`⚔️ Fight: ${resultDescriptions[result]}`)
    .addFields({ name: 'Total Elims', value: `${session.currentState.eliminations}`, inline: true });

  await interaction.reply({ embeds: [embed] });
}

async function handlePosition(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const grid = interaction.options.getString('grid').toUpperCase();
  const zoneCenter = interaction.options.getString('zonecenter')?.toUpperCase();

  session.updateState({ position: grid, zoneCenter: zoneCenter || session.currentState.zoneCenter });
  session.addEvent('position_update', { grid, zoneCenter });

  io.emit('position_update', {
    guildId: interaction.guildId,
    position: grid,
    zoneCenter
  });

  const embed = new EmbedBuilder()
    .setColor(0x6366f1)
    .setTitle(`📍 Position: ${grid}`)
    .setDescription(zoneCenter ? `Zone center: ${zoneCenter}` : 'Use `/igl position` with zonecenter to get rotation advice');

  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const state = session.currentState;
  const totalMats = state.mats.wood + state.mats.brick + state.mats.metal;
  const gameTime = Math.round((Date.now() - session.startTime) / 1000 / 60);

  const embed = new EmbedBuilder()
    .setColor(0x6366f1)
    .setTitle('📊 Current Game Status')
    .addFields(
      { name: '🌀 Zone', value: `${state.zone}`, inline: true },
      { name: '👥 Teams', value: `${state.teamsAlive}`, inline: true },
      { name: '⏱️ Time', value: `${gameTime} min`, inline: true },
      { name: '⚡ Surge', value: state.surgeStatus.replace('_', ' '), inline: true },
      { name: '🪵 Mats', value: `${totalMats}`, inline: true },
      { name: '💀 Elims', value: `${state.eliminations}`, inline: true }
    );

  if (session.warnings.length > 0) {
    embed.addFields({ name: '⚠️ WARNINGS', value: session.warnings.join('\n') });
  }
  if (session.insights.length > 0) {
    embed.addFields({ name: '💡 INSIGHTS', value: session.insights.join('\n') });
  }

  await interaction.reply({ embeds: [embed] });
}

async function handleGameEnd(interaction) {
  const session = gameSessions.get(interaction.guildId);
  if (!session) {
    return interaction.reply({ content: '❌ No active session!', ephemeral: true });
  }

  const placement = interaction.options.getInteger('placement');
  const elims = interaction.options.getInteger('elims');

  session.currentState.placement = placement;
  session.currentState.eliminations = elims;
  session.addEvent('game_end', { placement, elims });

  const recap = session.generateRecap();

  io.emit('game_end', {
    guildId: interaction.guildId,
    recap
  });

  // Calculate points (FNCS 2026 scoring)
  const placementPoints = getPlacementPoints(placement);
  const elimPoints = elims * 2;
  const totalPoints = placementPoints + elimPoints;

  const embed = new EmbedBuilder()
    .setColor(placement <= 3 ? 0x10b981 : placement <= 10 ? 0xf59e0b : 0xef4444)
    .setTitle(`🏆 Game Recap - #${placement}`)
    .setDescription(`**${recap.duration}** | **${elims} Elims**`)
    .addFields(
      { name: '📊 Points', value: `Placement: ${placementPoints}\nElims: ${elimPoints}\n**Total: ${totalPoints}**`, inline: true }
    );

  if (recap.analysis.strengths.length > 0) {
    embed.addFields({ name: '✅ What Went Well', value: recap.analysis.strengths.join('\n') });
  }
  if (recap.analysis.improvements.length > 0) {
    embed.addFields({ name: '📈 To Improve', value: recap.analysis.improvements.join('\n') });
  }
  if (recap.analysis.keyMoments.length > 0) {
    const moments = recap.analysis.keyMoments.map(m => `• ${m.time}: ${m.description}`).join('\n');
    embed.addFields({ name: '🎯 Key Moments', value: moments });
  }

  // Cleanup session
  const connection = getVoiceConnection(interaction.guildId);
  if (connection) {
    connection.destroy();
  }
  gameSessions.delete(interaction.guildId);

  await interaction.reply({ embeds: [embed] });
}

// Helper functions
function getZoneAdvice(zone, teams) {
  if (zone <= 2 && teams > 30) return '🏃 Early game - focus on looting, avoid unnecessary fights';
  if (zone === 3 && teams > 20) return '🎯 Midgame - rotate now if zone is far, hit surge if needed';
  if (zone === 4) return '⚡ Half-half - claim your layer, watch for teams rotating';
  if (zone >= 5 && teams > 10) return '🏠 Moving zones - stay on edge, tarp efficiently';
  if (zone >= 6 && teams <= 10) return '🔥 Endgame - every decision matters, play for placement';
  return '💡 Stay focused, trust your reads';
}

function getSurgeAdvice(status) {
  switch (status) {
    case 'ahead_10+': return '✅ Comfortable - play passive, dont take unnecessary risks';
    case 'ahead_5': return '👍 Good position - maintain, maybe get 1-2 more tags for safety';
    case 'even': return '➡️ Borderline - look for free AR tags, dont force fights';
    case 'behind_5': return '⚠️ Need damage - AR peek for tags, consider pushing weak teams';
    case 'behind_10+': return '🚨 EMERGENCY - Must fight or take storm damage. Push NOW!';
  }
}

function getMatsAdvice(total, zone) {
  if (total < 300 && zone >= 4) return '🚨 CRITICAL - Need to refarm immediately!';
  if (total < 500 && zone >= 5) return '⚠️ Low for endgame - hit trees/pallets when safe';
  if (total >= 1000) return '✅ Stacked - good for endgame';
  return '👍 Decent - keep farming when possible';
}

function getPlacementPoints(placement) {
  const points = {
    1: 25, 2: 20, 3: 16, 4: 14, 5: 12,
    6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
    11: 5, 12: 5, 13: 4, 14: 4, 15: 3,
    16: 2, 17: 2, 18: 2, 19: 1, 20: 1
  };
  return points[placement] || 0;
}

// WebSocket for dashboard connection
io.on('connection', socket => {
  console.log('📊 Dashboard connected');

  socket.on('request_state', guildId => {
    const session = gameSessions.get(guildId);
    if (session) {
      socket.emit('state_update', { guildId, state: session.currentState });
    }
  });
});

// Start servers
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌐 WebSocket server running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
