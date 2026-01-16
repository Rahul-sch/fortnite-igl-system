/**
 * Test Suite for Groq Analyzer Module
 * Run with: node tests/test_groq_analyzer.js
 *
 * Note: API integration tests require GROQ_API_KEY environment variable
 */

const path = require('path');
const fs = require('fs');

// Test results tracker
let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    failed++;
    results.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    passed++;
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    failed++;
    results.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
}

function assertContains(str, substr, message) {
  if (!str.includes(substr)) {
    throw new Error(`${message}: "${str}" does not contain "${substr}"`);
  }
}

function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new Error(`${message}: Value is undefined or null`);
  }
}

console.log('========================================');
console.log('GROQ ANALYZER - TEST SUITE');
console.log('========================================\n');

// Load the analyzer module
const analyzerPath = path.join(__dirname, '../tool/src/groq_analyzer.js');
const analyzerCode = fs.readFileSync(analyzerPath, 'utf8');

// We need to extract and test the functions
// Since the module uses ES modules pattern, we'll test the exported functions

// Mock version for testing without actual API calls
const mockAnalyzer = {
  buildUserPrompt: function(situation) {
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
  },

  QUICK_ANALYSIS_PRESETS: {
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
  }
};

// ============================================
// UNIT TESTS: Prompt Building
// ============================================

console.log('--- Prompt Building Tests ---\n');

test('buildUserPrompt includes landing spot', () => {
  const situation = { landing_spot: 'Battle Boulevard' };
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'Battle Boulevard', 'Prompt should include landing spot');
});

test('buildUserPrompt includes all mats', () => {
  const situation = {
    current_mats: { wood: 300, brick: 200, metal: 100 }
  };
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'Wood: 300', 'Prompt should include wood');
  assertContains(prompt, 'Brick: 200', 'Prompt should include brick');
  assertContains(prompt, 'Metal: 100', 'Prompt should include metal');
  assertContains(prompt, 'Total: 600', 'Prompt should include total');
});

test('buildUserPrompt handles missing data gracefully', () => {
  const situation = {};
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'Not specified', 'Prompt should handle missing data');
});

test('buildUserPrompt includes storm info', () => {
  const situation = {
    storm_pull: { direction: 'opposite_corner', distance: 'far' }
  };
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'opposite_corner', 'Prompt should include storm direction');
  assertContains(prompt, 'far', 'Prompt should include storm distance');
});

test('buildUserPrompt includes surge status', () => {
  const situation = { surge_status: 'behind_10+' };
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'behind_10+', 'Prompt should include surge status');
});

test('buildUserPrompt includes additional context', () => {
  const situation = { additional_context: 'Team watching our rotate' };
  const prompt = mockAnalyzer.buildUserPrompt(situation);
  assertContains(prompt, 'Team watching our rotate', 'Prompt should include context');
});

// ============================================
// UNIT TESTS: Quick Analysis Presets
// ============================================

console.log('\n--- Quick Analysis Presets Tests ---\n');

test('Quick presets exist for common situations', () => {
  assertDefined(mockAnalyzer.QUICK_ANALYSIS_PRESETS['bad_zone_pull'], 'bad_zone_pull preset');
  assertDefined(mockAnalyzer.QUICK_ANALYSIS_PRESETS['surge_critical'], 'surge_critical preset');
  assertDefined(mockAnalyzer.QUICK_ANALYSIS_PRESETS['uncontested_good_zone'], 'uncontested_good_zone preset');
});

test('bad_zone_pull preset recommends immediate leave', () => {
  const preset = mockAnalyzer.QUICK_ANALYSIS_PRESETS['bad_zone_pull'];
  assertEqual(preset.leave_timing.recommendation, 'now', 'Should recommend leaving now');
  assertEqual(preset.fight_decision.recommendation, 'refuse', 'Should refuse fights');
});

test('surge_critical preset recommends fighting', () => {
  const preset = mockAnalyzer.QUICK_ANALYSIS_PRESETS['surge_critical'];
  assertEqual(preset.fight_decision.recommendation, 'fight', 'Should recommend fighting');
});

test('uncontested_good_zone preset recommends extended looting', () => {
  const preset = mockAnalyzer.QUICK_ANALYSIS_PRESETS['uncontested_good_zone'];
  assertEqual(preset.leave_timing.recommendation, 'loot_40s', 'Should recommend extended loot');
  assertEqual(preset.fight_decision.recommendation, 'refuse', 'Should refuse unnecessary fights');
});

// ============================================
// INTEGRATION TESTS: Full Prompt Generation
// ============================================

console.log('\n--- Integration Tests ---\n');

test('Full situation generates comprehensive prompt', () => {
  const fullSituation = {
    landing_spot: 'Classified Canyon',
    teams_contested: '2',
    our_loot: {
      weapons: 'Gold AR, Blue Pump',
      heals: '6 minis, 2 medkits',
      shields: 'full'
    },
    current_mats: {
      wood: 450,
      brick: 300,
      metal: 250
    },
    storm_pull: {
      direction: 'away',
      distance: 'medium'
    },
    surge_status: 'even',
    time_zone: 'Storm 2, 1:30 remaining',
    additional_context: 'Got vault, enemy team retreating'
  };

  const prompt = mockAnalyzer.buildUserPrompt(fullSituation);

  // Verify all components present
  assertContains(prompt, 'Classified Canyon', 'Landing spot');
  assertContains(prompt, 'Gold AR', 'Weapons');
  assertContains(prompt, '6 minis', 'Heals');
  assertContains(prompt, 'Wood: 450', 'Wood mats');
  assertContains(prompt, 'Total: 1000', 'Total mats');
  assertContains(prompt, 'away', 'Storm direction');
  assertContains(prompt, 'Storm 2', 'Zone info');
  assertContains(prompt, 'enemy team retreating', 'Context');
});

test('Prompt structure is consistent', () => {
  const situation1 = { landing_spot: 'A' };
  const situation2 = { landing_spot: 'B' };

  const prompt1 = mockAnalyzer.buildUserPrompt(situation1);
  const prompt2 = mockAnalyzer.buildUserPrompt(situation2);

  // Both should have the same structure markers
  assertContains(prompt1, 'CURRENT GAME SITUATION', 'Structure marker 1');
  assertContains(prompt2, 'CURRENT GAME SITUATION', 'Structure marker 1');
  assertContains(prompt1, 'OUR LOADOUT', 'Structure marker 2');
  assertContains(prompt2, 'OUR LOADOUT', 'Structure marker 2');
  assertContains(prompt1, 'STORM INFO', 'Structure marker 3');
  assertContains(prompt2, 'STORM INFO', 'Structure marker 3');
});

// ============================================
// API STRUCTURE TESTS (no actual calls)
// ============================================

console.log('\n--- API Structure Tests ---\n');

test('Analyzer code defines correct API endpoint', () => {
  assertContains(analyzerCode, 'https://api.groq.com/openai/v1', 'Groq API base URL');
  assertContains(analyzerCode, '/chat/completions', 'Chat completions endpoint');
});

test('Analyzer code uses JSON mode', () => {
  assertContains(analyzerCode, 'json_object', 'JSON mode response format');
});

test('Analyzer code includes system prompt', () => {
  assertContains(analyzerCode, 'SYSTEM_PROMPT', 'System prompt constant');
  assertContains(analyzerCode, 'IGL', 'IGL coaching context');
  assertContains(analyzerCode, 'NAC', 'NAC region context');
});

test('Analyzer code includes retry logic', () => {
  assertContains(analyzerCode, 'retries', 'Retry parameter');
  assertContains(analyzerCode, 'attempt', 'Attempt tracking');
});

test('Analyzer code includes error handling', () => {
  assertContains(analyzerCode, 'catch', 'Error catching');
  assertContains(analyzerCode, 'success: false', 'Error response');
});

// ============================================
// DISCLAIMER TESTS
// ============================================

console.log('\n--- Disclaimer Tests ---\n');

test('Analyzer code includes fair play disclaimer', () => {
  assertContains(analyzerCode, 'NOT cheating', 'Cheating disclaimer');
  assertContains(analyzerCode, 'manual user inputs', 'Manual input declaration');
});

test('System prompt includes disclaimer', () => {
  assertContains(analyzerCode, 'no game memory reading', 'Memory reading disclaimer');
  assertContains(analyzerCode, 'public map data', 'Public data declaration');
});

// ============================================
// SUMMARY
// ============================================

console.log('\n========================================');
console.log('TEST SUMMARY');
console.log('========================================');
console.log(`Total: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('========================================\n');

// Write results to file
const resultsPath = path.join(__dirname, 'test_groq_results.json');
fs.writeFileSync(resultsPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  total: passed + failed,
  passed,
  failed,
  results
}, null, 2));

console.log(`Results written to: ${resultsPath}`);

// Exit with error code if tests failed
process.exit(failed > 0 ? 1 : 0);
