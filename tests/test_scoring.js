/**
 * Test Suite for POI Scoring Engine
 * Run with: node tests/test_scoring.js
 */

const path = require('path');
const fs = require('fs');

// Load scoring engine
const scoringEngine = require('../data/scoring_engine.js');
const {
  calculateScore,
  rankPOIs,
  generateAllRankings,
  calcRotatePotential,
  calcLootQuality,
  calcShieldAvailability,
  calcMaterials,
  calcSurgePotential,
  calcContestRiskInverse,
  SCORING_PRESETS
} = scoringEngine;

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

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: Expected ${expected}, got ${actual}`);
  }
}

function assertInRange(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(`${message}: ${value} not in range [${min}, ${max}]`);
  }
}

function assertDefined(value, message) {
  if (value === undefined || value === null) {
    throw new Error(`${message}: Value is undefined or null`);
  }
}

console.log('========================================');
console.log('POI SCORING ENGINE - TEST SUITE');
console.log('========================================\n');

// ============================================
// UNIT TESTS: Component Score Functions
// ============================================

console.log('--- Component Score Functions ---\n');

test('calcRotatePotential returns score in valid range', () => {
  const poi = {
    rotation_data: { center_distance: 'close' },
    mobility: { launch_pads: 1, hot_air_balloon_station: true, vehicles: ['cars'] }
  };
  const score = calcRotatePotential(poi);
  assertInRange(score, 0, 10, 'Rotate potential score');
});

test('calcRotatePotential gives higher score for closer POIs', () => {
  const closePOI = { rotation_data: { center_distance: 'close' }, mobility: {} };
  const farPOI = { rotation_data: { center_distance: 'far' }, mobility: {} };

  const closeScore = calcRotatePotential(closePOI);
  const farScore = calcRotatePotential(farPOI);

  if (closeScore <= farScore) {
    throw new Error(`Close POI (${closeScore}) should score higher than far POI (${farScore})`);
  }
});

test('calcLootQuality returns score in valid range', () => {
  const poi = { loot: { chests: 20, rare_chests: 3, ammo_boxes: 25 } };
  const score = calcLootQuality(poi);
  assertInRange(score, 0, 10, 'Loot quality score');
});

test('calcLootQuality handles missing loot data', () => {
  const poi = {};
  const score = calcLootQuality(poi);
  assertEqual(score, 0, 'Score for empty loot');
});

test('calcShieldAvailability returns score in valid range', () => {
  const poi = { shields: { slurp_barrels: 4, slurp_trucks: 1, vending_machines: 2 } };
  const score = calcShieldAvailability(poi);
  assertInRange(score, 0, 10, 'Shield availability score');
});

test('calcShieldAvailability values slurp trucks highly', () => {
  const withTruck = { shields: { slurp_trucks: 1 } };
  const withBarrels = { shields: { slurp_barrels: 2 } };

  const truckScore = calcShieldAvailability(withTruck);
  const barrelScore = calcShieldAvailability(withBarrels);

  if (truckScore <= barrelScore) {
    throw new Error('Slurp truck should provide more shield value than 2 barrels');
  }
});

test('calcMaterials returns score in valid range', () => {
  const poi = { materials: { wood: 8, brick: 6, metal: 7 } };
  const score = calcMaterials(poi);
  assertInRange(score, 0, 10, 'Materials score');
});

test('calcSurgePotential returns score in valid range', () => {
  const poi = {
    surge_potential: {
      tag_opportunities: 'high',
      early_fight_viability: 'good',
      safe_angles: 3
    }
  };
  const score = calcSurgePotential(poi);
  assertInRange(score, 0, 10, 'Surge potential score');
});

test('calcContestRiskInverse returns higher score for lower popularity', () => {
  const lowPop = { contest_data: { popularity: 'very_low', offspawn_fight_likelihood: '10%' } };
  const highPop = { contest_data: { popularity: 'very_high', offspawn_fight_likelihood: '90%' } };

  const lowPopScore = calcContestRiskInverse(lowPop);
  const highPopScore = calcContestRiskInverse(highPop);

  if (lowPopScore <= highPopScore) {
    throw new Error(`Low popularity (${lowPopScore}) should score higher than high popularity (${highPopScore})`);
  }
});

// ============================================
// UNIT TESTS: Scoring Presets
// ============================================

console.log('\n--- Scoring Presets ---\n');

test('All presets have weights summing to 1.0', () => {
  for (const [presetName, weights] of Object.entries(SCORING_PRESETS)) {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.001) {
      throw new Error(`${presetName} weights sum to ${sum}, should be 1.0`);
    }
  }
});

test('Super safe preset has highest contest_risk_inverse weight', () => {
  const safeCRWeight = SCORING_PRESETS.super_safe.contest_risk_inverse;
  const balancedCRWeight = SCORING_PRESETS.balanced.contest_risk_inverse;
  const riskyCRWeight = SCORING_PRESETS.risky_keying.contest_risk_inverse;

  if (safeCRWeight <= balancedCRWeight || safeCRWeight <= riskyCRWeight) {
    throw new Error('Super safe should have highest contest_risk_inverse weight');
  }
});

test('Risky preset has highest surge_potential weight', () => {
  const riskySurgeWeight = SCORING_PRESETS.risky_keying.surge_potential;
  const balancedSurgeWeight = SCORING_PRESETS.balanced.surge_potential;
  const safeSurgeWeight = SCORING_PRESETS.super_safe.surge_potential;

  if (riskySurgeWeight <= balancedSurgeWeight || riskySurgeWeight <= safeSurgeWeight) {
    throw new Error('Risky preset should have highest surge_potential weight');
  }
});

// ============================================
// INTEGRATION TESTS: Full Scoring
// ============================================

console.log('\n--- Integration Tests ---\n');

test('calculateScore returns valid structure', () => {
  const poi = {
    id: 'test_poi',
    name: 'Test POI',
    type: 'named_poi',
    rotation_data: { center_distance: 'medium' },
    loot: { chests: 15, rare_chests: 2 },
    shields: { slurp_barrels: 3 },
    materials: { wood: 6, brick: 5, metal: 5 },
    surge_potential: { tag_opportunities: 'medium', early_fight_viability: 'good', safe_angles: 2 },
    contest_data: { popularity: 'medium', offspawn_fight_likelihood: '50%' },
    mobility: {}
  };

  const result = calculateScore(poi, 'balanced');

  assertDefined(result.poi_id, 'poi_id');
  assertDefined(result.poi_name, 'poi_name');
  assertDefined(result.composite_score, 'composite_score');
  assertDefined(result.component_scores, 'component_scores');
  assertDefined(result.weights_used, 'weights_used');
  assertInRange(result.composite_score, 0, 10, 'Composite score');
});

test('calculateScore produces different results for different presets', () => {
  const poi = {
    id: 'test_poi',
    name: 'Test POI',
    rotation_data: { center_distance: 'far' },
    loot: { chests: 25, rare_chests: 5 },
    shields: { slurp_barrels: 2 },
    materials: { wood: 5, brick: 5, metal: 5 },
    surge_potential: { tag_opportunities: 'high', early_fight_viability: 'excellent', safe_angles: 4 },
    contest_data: { popularity: 'high', offspawn_fight_likelihood: '80%' },
    mobility: {}
  };

  const balancedScore = calculateScore(poi, 'balanced').composite_score;
  const safeScore = calculateScore(poi, 'super_safe').composite_score;
  const riskyScore = calculateScore(poi, 'risky_keying').composite_score;

  // This POI has high loot/surge but high contest - should score lower in safe mode
  if (safeScore >= balancedScore) {
    throw new Error('High contest POI should score lower in safe mode');
  }
});

// ============================================
// DATASET TESTS
// ============================================

console.log('\n--- Dataset Tests ---\n');

test('Dataset file exists and is valid JSON', () => {
  const datasetPath = path.join(__dirname, '../data/poi_dataset.json');
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  assertDefined(data.named_pois, 'named_pois array');
  assertDefined(data.landmarks, 'landmarks array');

  if (data.named_pois.length === 0) {
    throw new Error('named_pois array is empty');
  }
});

test('All POIs have required fields', () => {
  const datasetPath = path.join(__dirname, '../data/poi_dataset.json');
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const allPOIs = [...data.named_pois, ...data.landmarks];
  const requiredFields = ['id', 'name', 'type'];

  for (const poi of allPOIs) {
    for (const field of requiredFields) {
      if (!poi[field]) {
        throw new Error(`POI ${poi.name || 'unknown'} missing required field: ${field}`);
      }
    }
  }
});

test('rankPOIs returns sorted results', () => {
  const datasetPath = path.join(__dirname, '../data/poi_dataset.json');
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const rankings = rankPOIs(data, 'balanced');

  // Check rankings are sorted descending
  for (let i = 1; i < rankings.length; i++) {
    if (rankings[i].composite_score > rankings[i - 1].composite_score) {
      throw new Error('Rankings not sorted correctly');
    }
  }

  // Check ranks are sequential
  for (let i = 0; i < rankings.length; i++) {
    if (rankings[i].rank !== i + 1) {
      throw new Error(`Rank ${rankings[i].rank} should be ${i + 1}`);
    }
  }
});

test('generateAllRankings produces all three preset rankings', () => {
  const datasetPath = path.join(__dirname, '../data/poi_dataset.json');
  const data = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

  const allRankings = generateAllRankings(data);

  assertDefined(allRankings.balanced, 'balanced rankings');
  assertDefined(allRankings.super_safe, 'super_safe rankings');
  assertDefined(allRankings.risky_keying, 'risky_keying rankings');
  assertDefined(allRankings.generated_at, 'generated_at timestamp');
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
const resultsPath = path.join(__dirname, 'test_results.json');
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
