/**
 * Groq-Powered In-Game Situation Analyzer
 * Uses Groq's OpenAI-compatible API for fast inference
 *
 * IMPORTANT: This is NOT cheating. It uses ONLY manual user inputs.
 * No memory reading, no overlays, no automated game data extraction.
 *
 * API Documentation: https://console.groq.com/docs/text-chat
 * Structured Outputs: https://console.groq.com/docs/structured-outputs
 */

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GROQ_CHAT_ENDPOINT = `${GROQ_API_BASE}/chat/completions`;

// Default model - fast and capable
const DEFAULT_MODEL = 'llama-3.1-70b-versatile';

/**
 * System prompt that encodes competitive Fortnite macro knowledge
 */
const SYSTEM_PROMPT = `You are an elite Fortnite IGL (In-Game Leader) coach specializing in competitive duos rotations and positioning. You provide precise, actionable tactical advice based on manual inputs provided by the player.

IMPORTANT DISCLAIMERS:
- This system uses ONLY manual user inputs - no game memory reading or automated data extraction
- All advice is based on public map data and competitive macro principles
- This is a decision-support tool, not a cheat

YOUR EXPERTISE:
- NAC competitive meta (35-45ms ping considerations)
- Chapter 7 Season 1 Pacific Break map knowledge
- Rotation timing, deadside creation, surge management
- High ping adaptation strategies (avoid piece control, favor positioning)

WHEN GIVING ADVICE:
1. Be SPECIFIC - give exact timing, directions, mat numbers
2. Be CONCISE - players need quick info, not essays
3. PRIORITIZE survival over kills unless surge demands otherwise
4. Always consider the 35-45ms ping disadvantage in fight recommendations

RESPONSE FORMAT (JSON):
{
  "leave_timing": {
    "recommendation": "now" | "loot_20s" | "loot_40s" | "hold_position",
    "reasoning": "brief explanation"
  },
  "rotate_paths": [
    {
      "name": "Path A (Recommended)",
      "description": "specific path description",
      "risk_level": "low" | "medium" | "high",
      "time_estimate": "Xs"
    },
    {
      "name": "Path B (Alternative)",
      "description": "specific path description",
      "risk_level": "low" | "medium" | "high",
      "time_estimate": "Xs"
    }
  ],
  "mats_plan": {
    "current_assessment": "good" | "low" | "critical",
    "target_before_endgame": "X/Y/Z",
    "refarm_locations": ["location 1", "location 2"],
    "priority": "wood" | "brick" | "metal" | "any"
  },
  "fight_decision": {
    "recommendation": "fight" | "refuse" | "only_if_necessary",
    "reasoning": "brief explanation",
    "conditions": ["condition 1", "condition 2"]
  },
  "surge_plan": {
    "status": "ahead" | "close" | "behind" | "critical",
    "action": "passive" | "look_for_tags" | "must_fight" | "emergency",
    "tag_spots": ["spot 1", "spot 2"]
  },
  "contingency": {
    "if_keyed": "specific action if pushed mid-rotate",
    "if_zone_shifts": "what to do if zone pulls different than expected"
  },
  "priority_actions": ["action 1 (most important)", "action 2", "action 3"]
}`;

/**
 * Build the user prompt from game situation inputs
 */
function buildUserPrompt(situation) {
  const {
    landing_spot,
    teams_contested,
    our_loot,
    current_mats,
    storm_pull,
    surge_status,
    time_zone,
    additional_context
  } = situation;

  let prompt = `CURRENT GAME SITUATION:\n\n`;

  prompt += `LANDING SPOT: ${landing_spot || 'Not specified'}\n`;
  prompt += `TEAMS CONTESTED: ${teams_contested || '0'}\n`;

  prompt += `\nOUR LOADOUT:\n`;
  if (our_loot) {
    prompt += `- Weapons: ${our_loot.weapons || 'Not specified'}\n`;
    prompt += `- Heals: ${our_loot.heals || 'Not specified'}\n`;
    prompt += `- Shields: ${our_loot.shields || 'Not specified'}\n`;
  } else {
    prompt += `- Not specified\n`;
  }

  prompt += `\nCURRENT MATS:\n`;
  if (current_mats) {
    prompt += `- Wood: ${current_mats.wood || 0}\n`;
    prompt += `- Brick: ${current_mats.brick || 0}\n`;
    prompt += `- Metal: ${current_mats.metal || 0}\n`;
    prompt += `- Total: ${(current_mats.wood || 0) + (current_mats.brick || 0) + (current_mats.metal || 0)}\n`;
  } else {
    prompt += `- Not specified\n`;
  }

  prompt += `\nSTORM INFO:\n`;
  prompt += `- Pull Direction: ${storm_pull?.direction || 'Not specified'}\n`;
  prompt += `- Distance to Zone: ${storm_pull?.distance || 'Not specified'}\n`;

  prompt += `\nSURGE STATUS: ${surge_status || 'Not specified'}\n`;

  prompt += `\nTIME/ZONE: ${time_zone || 'Not specified'}\n`;

  if (additional_context) {
    prompt += `\nADDITIONAL CONTEXT: ${additional_context}\n`;
  }

  prompt += `\nProvide your tactical analysis in the specified JSON format. Be specific and actionable.`;

  return prompt;
}

/**
 * Call Groq API with retry logic
 */
async function callGroqAPI(apiKey, messages, retries = 3) {
  const requestBody = {
    model: DEFAULT_MODEL,
    messages: messages,
    temperature: 0.3, // Lower temperature for more consistent tactical advice
    max_tokens: 2000,
    response_format: { type: "json_object" }
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(GROQ_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0]?.message?.content,
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        return {
          success: false,
          error: error.message,
          attempts: attempt
        };
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Parse and validate the JSON response
 */
function parseAnalysisResponse(content) {
  try {
    const parsed = JSON.parse(content);

    // Validate required fields exist
    const requiredFields = ['leave_timing', 'rotate_paths', 'mats_plan', 'fight_decision', 'surge_plan', 'priority_actions'];
    const missingFields = requiredFields.filter(field => !parsed[field]);

    if (missingFields.length > 0) {
      console.warn(`Response missing fields: ${missingFields.join(', ')}`);
    }

    return {
      success: true,
      analysis: parsed
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`,
      raw_content: content
    };
  }
}

/**
 * Main analysis function
 * @param {string} apiKey - Groq API key
 * @param {object} situation - Game situation inputs
 * @returns {object} Analysis result with tactical recommendations
 */
async function analyzeGameSituation(apiKey, situation) {
  if (!apiKey) {
    return {
      success: false,
      error: 'Groq API key is required'
    };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(situation) }
  ];

  const apiResult = await callGroqAPI(apiKey, messages);

  if (!apiResult.success) {
    return apiResult;
  }

  const parseResult = parseAnalysisResponse(apiResult.content);

  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error,
      raw_response: apiResult.content
    };
  }

  return {
    success: true,
    analysis: parseResult.analysis,
    meta: {
      model: apiResult.model,
      tokens_used: apiResult.usage,
      disclaimer: "This analysis is based on manual user inputs only. No game memory reading or automated data extraction is used."
    }
  };
}

/**
 * Quick analysis for common situations
 */
const QUICK_ANALYSIS_PRESETS = {
  'bad_zone_pull': {
    leave_timing: { recommendation: 'now', reasoning: 'Zone pulling opposite corner requires immediate rotation' },
    fight_decision: { recommendation: 'refuse', reasoning: 'Cannot afford time loss from fights during long rotate' }
  },
  'surge_critical': {
    leave_timing: { recommendation: 'hold_position', reasoning: 'Need to address surge before rotating' },
    fight_decision: { recommendation: 'fight', reasoning: 'Must get damage/kills to avoid storm damage from surge' }
  },
  'uncontested_good_zone': {
    leave_timing: { recommendation: 'loot_40s', reasoning: 'Zone favorable, maximize loot before rotating' },
    fight_decision: { recommendation: 'refuse', reasoning: 'No need to risk fights when position is good' }
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzeGameSituation,
    buildUserPrompt,
    QUICK_ANALYSIS_PRESETS,
    GROQ_API_BASE,
    DEFAULT_MODEL
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.GroqAnalyzer = {
    analyzeGameSituation,
    buildUserPrompt,
    QUICK_ANALYSIS_PRESETS
  };
}
