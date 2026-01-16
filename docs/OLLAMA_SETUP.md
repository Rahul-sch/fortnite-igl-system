# Ollama Setup Guide

100% FREE local AI for Fortnite tactical analysis.

## What is Ollama?

Ollama runs AI language models locally on your PC.
- **$0/month** - No API costs
- - **Works offline** - No internet required
  - - **Private** - Data never leaves your PC
   
    - ## Installation
   
    - ### Windows
    - Download from: https://ollama.ai/download
   
    - ### Mac
    - ```bash
      brew install ollama
      ```

      ### Linux
      ```bash
      curl -fsSL https://ollama.ai/install.sh | sh
      ```

      ## Download Model

      ```bash
      ollama pull llama3.1:8b
      ```

      This downloads ~4.7GB (5-10 min).

      ## Running

      ```bash
      # Start Ollama server
      ollama serve

      # Test it works
      ollama run llama3.1:8b "Give me a Fortnite tip"
      ```

      ## Testing with Discord Bot

      ```bash
      cd discord-bot
      node ollama-client.js
      ```

      Should show: `Health: { healthy: true, models: ['llama3.1:8b'] }`

      ## Alternative Models

      | Model | Size | Speed | For |
      |-------|------|-------|-----|
      | `llama3.1:8b` | 4.7GB | Fast | Recommended |
      | `llama3.2:3b` | 2GB | Faster | Low-end PCs |
      | `mistral:7b` | 4GB | Fast | Alternative |

      ## Cost Comparison

      | Solution | Monthly Cost |
      |----------|-------------|
      | **Ollama** | **$0** |
      | OpenAI | $20-100+ |
      | Claude API | $20-50+ |

      **Ollama wins!**
