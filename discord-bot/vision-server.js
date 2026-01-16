/**
 * Vision Server - WebSocket server for Vision Agent communication
 * Receives real-time game state from Python vision agent
 * 100% LOCAL - No cloud dependencies!
 */

const WebSocket = require('ws');
const EventEmitter = require('events');

class VisionServer extends EventEmitter {
      constructor(port = 8765) {
                super();
                this.port = port;
                this.wss = null;
                this.clients = new Set();
                this.latestState = null;
                this.stateHistory = [];
                this.maxHistory = 100;
                this.isRunning = false;
      }

    start() {
              if (this.isRunning) return;
              this.wss = new WebSocket.Server({ port: this.port });

          this.wss.on('listening', () => {
                        this.isRunning = true;
                        console.log(`Vision server on ws://localhost:${this.port}`);
          });

          this.wss.on('connection', (ws) => {
                        console.log('Vision agent connected');
                        this.clients.add(ws);
                        this.emit('agent_connected');
                        ws.send(JSON.stringify({ type: 'connected', message: 'Vision server ready' }));

                                  ws.on('message', (data) => {
                                                    try {
                                                                          const message = JSON.parse(data.toString());
                                                                          this.handleMessage(message);
                                                    } catch (error) {
                                                                          console.error('Invalid message:', error);
                                                    }
                                  });

                                  ws.on('close', () => {
                                                    this.clients.delete(ws);
                                                    this.emit('agent_disconnected');
                                  });
          });
    }

    handleMessage(message) {
              const { type, data, timestamp } = message;
              switch (type) {
                case 'game_state':
                                  this.handleGameState(data, timestamp);
                                  break;
                case 'surge_warning':
                                  this.emit('surge_warning', data);
                                  break;
                case 'low_hp':
                                  this.emit('low_hp', data);
                                  break;
                case 'low_mats':
                                  this.emit('low_mats', data);
                                  break;
                case 'elimination':
                                  this.emit('elimination', data);
                                  break;
                case 'storm_phase':
                                  this.emit('storm_phase', data);
                                  break;
              }
    }

    handleGameState(state, timestamp) {
              this.latestState = { ...state, receivedAt: Date.now(), sourceTimestamp: timestamp };
              this.stateHistory.push(this.latestState);
              if (this.stateHistory.length > this.maxHistory) {
                            this.stateHistory.shift();
              }
              this.emit('state_update', this.latestState);
    }

    getLatestState() {
              return this.latestState;
    }

    getStateHistory(count = 10) {
              return this.stateHistory.slice(-count);
    }

    isConnected() {
              return this.clients.size > 0;
    }

    sendToAgent(type, data = {}) {
              const message = JSON.stringify({ type, data, timestamp: Date.now() });
              this.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                              client.send(message);
                            }
              });
    }

    stop() {
              if (this.wss) {
                            this.clients.forEach(client => client.close());
                            this.wss.close();
                            this.isRunning = false;
              }
    }
}

module.exports = VisionServer;
