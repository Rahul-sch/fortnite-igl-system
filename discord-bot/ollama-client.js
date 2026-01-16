/**
 * Ollama LLM Client - 100% FREE local AI
 * Uses Ollama with Llama 3.1 8B for tactical analysis
 * No API keys, no costs, runs on your GPU!
 */

const http = require('http');

class OllamaClient {
      constructor(options = {}) {
                this.host = options.host || 'localhost';
                this.port = options.port || 11434;
                this.model = options.model || 'llama3.1:8b';
                this.timeout = options.timeout || 30000;
                this.systemPrompt = `You are an expert Fortnite competitive coach.
                Your role is to provide concise, actionable tactical advice.
                Key principles: Be brief (1-2 sentences), prioritize survival, consider surge.`;
      }

    async request(endpoint, data) {
              return new Promise((resolve, reject) => {
                            const postData = JSON.stringify(data);
                            const options = {
                                              hostname: this.host,
                                              port: this.port,
                                              path: endpoint,
                                              method: 'POST',
                                              headers: {
                                                                    'Content-Type': 'application/json',
                                                                    'Content-Length': Buffer.byteLength(postData)
                                              },
                                              timeout: this.timeout
                            };

                                             const req = http.request(options, (res) => {
                                                               let body = '';
                                                               res.on('data', chunk => body += chunk);
                                                               res.on('end', () => {
                                                                                     try { resolve(JSON.parse(body)); }
                                                                                     catch { resolve(body); }
                                                               });
                                             });
                            req.on('error', reject);
                            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
                            req.write(postData);
                            req.end();
              });
    }

    async checkHealth() {
              try {
                            const response = await this.request('/api/tags', {});
                            return { healthy: true, models: response.models?.map(m => m.name) || [] };
              } catch (err) {
                            return { healthy: false, error: err.message };
              }
    }

    async analyzeTactical(gameState) {
              const prompt = `Game state: HP=${gameState.hp}, Shield=${gameState.shield}, Mats=${(gameState.wood||0)+(gameState.brick||0)+(gameState.metal||0)}, Alive=${gameState.alive_players}, Surge=${gameState.surge_active?'ACTIVE':'no'}. Priority action?`;

          try {
                        const response = await this.request('/api/generate', {
                                          model: this.model,
                                          prompt: prompt,
                                          system: this.systemPrompt,
                                          stream: false,
                                          options: { temperature: 0.7, num_predict: 150 }
                        });
                        return { success: true, advice: response.response?.trim() || 'Play smart.' };
          } catch (err) {
                        return { success: false, advice: this.getFallbackAdvice(gameState) };
          }
    }

    getFallbackAdvice(state) {
              const warnings = [];
              if (state.surge_active) warnings.push('SURGE - Get tags NOW!');
              if ((state.hp||100) + (state.shield||0) < 75) warnings.push('Low HP - Find heals');
              if ((state.wood||0)+(state.brick||0)+(state.metal||0) < 300) warnings.push('Low mats - Farm');
              return warnings.length ? warnings.join(' | ') : 'Situation stable - play your game';
    }
}

module.exports = OllamaClient;

// Test
if (require.main === module) {
      const client = new OllamaClient();
      client.checkHealth().then(h => console.log('Health:', h));
}
