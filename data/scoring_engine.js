/**
 * POI Scoring Engine for Fortnite IGL System
 * Chapter 7 Season 1 - Pacific Break
 *
 * Calculates composite scores for each POI based on configurable weights
 * for different playstyles (SAFE / BALANCED / RISKY)
 */

const SCORING_PRESETS = {
  balanced: {
    rotate_potential: 0.30,
    loot_quality: 0.20,
    shield_availability: 0.15,
    materials: 0.15,
    surge_potential: 0.10,
    contest_risk_inverse: 0.10
  },
  super_safe: {
    rotate_potential: 0.20,
    loot_quality: 0.15,
    shield_availability: 0.20,
    materials: 0.15,
    surge_potential: 0.05,
    contest_risk_inverse: 0.25
  },
  risky_keying: {
    rotate_potential: 0.20,
    loot_quality: 0.25,
    shield_availability: 0.15,
    materials: 0.10,
    surge_potential: 0.20,
    contest_risk_inverse: 0.10
  }
};

/**
 * Normalize a value to 0-10 scale
 */
function normalize(value, min, max) {
  if (max === min) return 5;
  return Math.max(0, Math.min(10, ((value - min) / (max - min)) * 10));
}

/**
 * Calculate rotation potential score (0-10)
 * Based on center distance and mobility options
 */
function calcRotatePotential(poi) {
  const distanceScores = {
    'very_close': 10,
    'close': 8,
    'medium': 6,
    'far': 3,
    'very_far': 1
  };

  let score = distanceScores[poi.rotation_data?.center_distance] || 5;

  // Mobility bonuses
  if (poi.mobility?.launch_pads > 0) score += 1;
  if (poi.mobility?.hot_air_balloon_station) score += 0.5;
  if (poi.mobility?.ziplines > 0) score += 0.3;
  if (poi.mobility?.vehicles?.length > 0) score += 0.5;
  if (poi.mobility?.wingsuits) score += 0.3;

  return Math.min(10, score);
}

/**
 * Calculate loot quality score (0-10)
 * Based on chest count, rare chests, and ammo boxes
 */
function calcLootQuality(poi) {
  const chests = poi.loot?.chests || 0;
  const rareChests = poi.loot?.rare_chests || 0;
  const ammoBoxes = poi.loot?.ammo_boxes || 0;

  // Weighted loot score
  const lootScore = (chests * 1) + (rareChests * 2) + (ammoBoxes * 0.3);

  // Normalize to 0-10 (max expected ~50 for large POI)
  return normalize(lootScore, 0, 50);
}

/**
 * Calculate shield availability score (0-10)
 */
function calcShieldAvailability(poi) {
  const slurpBarrels = poi.shields?.slurp_barrels || 0;
  const slurpTrucks = poi.shields?.slurp_trucks || 0;
  const shieldKegs = poi.shields?.shield_kegs || 0;
  const vendingMachines = poi.shields?.vending_machines || 0;

  // Weighted shield score
  const shieldScore = (slurpBarrels * 1.5) + (slurpTrucks * 5) + (shieldKegs * 2) + (vendingMachines * 1);

  // Normalize to 0-10 (max expected ~15)
  return normalize(shieldScore, 0, 15);
}

/**
 * Calculate materials score (0-10)
 */
function calcMaterials(poi) {
  const wood = poi.materials?.wood || 0;
  const brick = poi.materials?.brick || 0;
  const metal = poi.materials?.metal || 0;

  // Total materials score (each rated 1-10)
  const totalScore = wood + brick + metal;

  // Normalize to 0-10 (max expected 30)
  return normalize(totalScore, 0, 30);
}

/**
 * Calculate surge potential score (0-10)
 */
function calcSurgePotential(poi) {
  const tagOpportunities = {
    'very_high': 10,
    'high': 8,
    'medium': 6,
    'low': 3,
    'very_low': 1,
    'none': 0
  };

  const fightViability = {
    'excellent': 10,
    'good': 7,
    'moderate': 5,
    'poor': 2,
    'none': 0
  };

  const tagScore = tagOpportunities[poi.surge_potential?.tag_opportunities] || 5;
  const fightScore = fightViability[poi.surge_potential?.early_fight_viability] || 5;
  const safeAngles = (poi.surge_potential?.safe_angles || 0) * 1.5;

  return Math.min(10, (tagScore + fightScore + safeAngles) / 2.5);
}

/**
 * Calculate contest risk inverse score (0-10)
 * Higher = LOWER contest risk (safer)
 */
function calcContestRiskInverse(poi) {
  const popularityScores = {
    'very_low': 10,
    'low': 8,
    'low_medium': 6,
    'medium': 5,
    'high': 2,
    'very_high': 0
  };

  const basScore = popularityScores[poi.contest_data?.popularity] || 5;

  // Parse offspawn fight likelihood
  const offspawnStr = poi.contest_data?.offspawn_fight_likelihood || '50%';
  const offspawnPct = parseInt(offspawnStr) / 100;
  const offspawnScore = (1 - offspawnPct) * 10;

  return (basScore + offspawnScore) / 2;
}

/**
 * Calculate composite score for a POI given a preset
 */
function calculateScore(poi, preset = 'balanced') {
  const weights = SCORING_PRESETS[preset] || SCORING_PRESETS.balanced;

  const scores = {
    rotate_potential: calcRotatePotential(poi),
    loot_quality: calcLootQuality(poi),
    shield_availability: calcShieldAvailability(poi),
    materials: calcMaterials(poi),
    surge_potential: calcSurgePotential(poi),
    contest_risk_inverse: calcContestRiskInverse(poi)
  };

  let compositeScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    compositeScore += (scores[key] || 0) * weight;
  }

  return {
    poi_id: poi.id,
    poi_name: poi.name,
    poi_type: poi.type,
    preset,
    composite_score: Math.round(compositeScore * 100) / 100,
    component_scores: scores,
    weights_used: weights
  };
}

/**
 * Rank all POIs for a given preset
 */
function rankPOIs(dataset, preset = 'balanced') {
  const allLocations = [
    ...(dataset.named_pois || []),
    ...(dataset.landmarks || [])
  ];

  const scored = allLocations.map(poi => calculateScore(poi, preset));

  // Sort by composite score descending
  scored.sort((a, b) => b.composite_score - a.composite_score);

  // Add rank
  return scored.map((item, index) => ({
    rank: index + 1,
    ...item
  }));
}

/**
 * Generate full rankings for all three presets
 */
function generateAllRankings(dataset) {
  return {
    balanced: rankPOIs(dataset, 'balanced'),
    super_safe: rankPOIs(dataset, 'super_safe'),
    risky_keying: rankPOIs(dataset, 'risky_keying'),
    generated_at: new Date().toISOString(),
    scoring_weights: SCORING_PRESETS
  };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCORING_PRESETS,
    calculateScore,
    rankPOIs,
    generateAllRankings,
    calcRotatePotential,
    calcLootQuality,
    calcShieldAvailability,
    calcMaterials,
    calcSurgePotential,
    calcContestRiskInverse
  };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.ScoringEngine = {
    SCORING_PRESETS,
    calculateScore,
    rankPOIs,
    generateAllRankings
  };
}
