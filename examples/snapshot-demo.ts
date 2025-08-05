import {
  defineConfig,
  createEngine,
  builtinOps,
  toSnapshot,
} from "../src/index";

console.log("=== toSnapshot() Helper Demo ===\n");

// Game configuration
const config = defineConfig({
  metrics: ["Health", "Strength", "Speed", "Defense"] as const,
  operations: builtinOps("sum", "subtract", "multiply"),
  attributes: [
    {
      key: "State",
      kind: "enum",
      values: ["Awake", "Asleep", "Stunned"] as const,
    },
    {
      key: "Class",
      kind: "enum",
      values: ["Warrior", "Mage", "Rogue"] as const,
    },
    {
      key: "Level",
      kind: "number",
      min: 1,
      max: 100,
      integer: true,
    },
    {
      key: "Enchanted",
      kind: "boolean",
    },
  ] as const,
});

const engine = createEngine(config);

// ====================================================================
// BASIC USAGE
// ====================================================================

console.log("🎯 Basic Usage");
console.log("━".repeat(50));

const basicPlayer = engine
  .builder("Hero")
  .set("State", "Awake")
  .set("Class", "Warrior")
  .set("Level", 25)
  .set("Enchanted", false)
  .increase("Health")
  .by(50)
  .increase("Strength")
  .by(20)
  .multiply("Defense")
  .by(1.3)
  .build();

const baseStats = { Health: 100, Strength: 15, Speed: 12, Defense: 10 };

// ✅ Get flat, predictable snapshot
const snapshot = toSnapshot(engine, basicPlayer, baseStats);

console.log("Snapshot result:");
console.log(JSON.stringify(snapshot, null, 2));
console.log("\nType-safe access:");
console.log("Name:", snapshot.name);
console.log("Final Health:", snapshot.metrics.Health); // 150 (100 + 50)
console.log("Final Strength:", snapshot.metrics.Strength); // 35 (15 + 20)
console.log("Final Defense:", snapshot.metrics.Defense); // 13 (10 * 1.3)
console.log("Player State:", snapshot.State); // "Awake"
console.log("Player Class:", snapshot.Class); // "Warrior"
console.log("Player Level:", snapshot.Level); // 25

// ====================================================================
// USE CASE EXAMPLES
// ====================================================================

console.log("\n📊 Use Case 1: API Response");
console.log("━".repeat(50));

function getPlayerAPI(playerId: string) {
  // Simulate loading player data
  const playerItem = engine
    .builder("Player_" + playerId)
    .set("State", "Awake")
    .set("Class", "Mage")
    .set("Level", 42)
    .set("Enchanted", true)
    .increase("Health")
    .by(75)
    .multiply("Speed")
    .by(1.5)
    .build();

  const playerBaseStats = { Health: 80, Strength: 10, Speed: 18, Defense: 8 };

  // ✅ Perfect for API responses - predictable shape
  const playerData = toSnapshot(engine, playerItem, playerBaseStats);

  return {
    success: true,
    data: playerData,
    timestamp: new Date().toISOString(),
  };
}

const apiResponse = getPlayerAPI("123");
console.log("API Response:", JSON.stringify(apiResponse, null, 2));

console.log("\n💾 Use Case 2: Database Storage");
console.log("━".repeat(50));

function savePlayerToDB(playerItem: any, baseStats: any) {
  const snapshot = toSnapshot(engine, playerItem, baseStats);

  // ✅ Flat structure perfect for SQL insertion
  const dbRecord = {
    player_id: "player_123",
    player_name: snapshot.name,
    health: snapshot.metrics.Health,
    strength: snapshot.metrics.Strength,
    speed: snapshot.metrics.Speed,
    defense: snapshot.metrics.Defense,
    state: snapshot.State,
    class: snapshot.Class,
    level: snapshot.Level,
    enchanted: snapshot.Enchanted,
    created_at: new Date(),
  };

  console.log("Database record:");
  console.log(JSON.stringify(dbRecord, null, 2));

  // INSERT INTO players VALUES (...) would work perfectly
}

savePlayerToDB(basicPlayer, baseStats);

console.log("\n📈 Use Case 3: Analytics");
console.log("━".repeat(50));

function analyzePlayerProgression(players: Array<{ item: any; base: any }>) {
  const snapshots = players.map((p) => toSnapshot(engine, p.item, p.base));

  // ✅ Easy to aggregate and analyze
  const analytics = {
    totalPlayers: snapshots.length,
    averageLevel:
      snapshots.reduce((sum, p) => sum + (p.Level ?? 0), 0) / snapshots.length,
    averageHealth:
      snapshots.reduce((sum, p) => sum + p.metrics.Health, 0) /
      snapshots.length,
    classCounts: snapshots.reduce((acc, p) => {
      acc[p.Class ?? ""] = (acc[p.Class ?? ""] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    strongestPlayer: snapshots.reduce((strongest, p) =>
      p.metrics.Strength > strongest.metrics.Strength ? p : strongest
    ),
  };

  console.log("Analytics:", JSON.stringify(analytics, null, 2));
}

// Create some test players
const players = [
  {
    item: engine
      .builder("Alice")
      .set("Class", "Warrior")
      .set("Level", 30)
      .increase("Strength")
      .by(25)
      .build(),
    base: { Health: 100, Strength: 20, Speed: 10, Defense: 15 },
  },
  {
    item: engine
      .builder("Bob")
      .set("Class", "Mage")
      .set("Level", 28)
      .increase("Health")
      .by(40)
      .build(),
    base: { Health: 70, Strength: 8, Speed: 15, Defense: 6 },
  },
  {
    item: engine
      .builder("Carol")
      .set("Class", "Rogue")
      .set("Level", 35)
      .multiply("Speed")
      .by(2)
      .build(),
    base: { Health: 85, Strength: 12, Speed: 20, Defense: 8 },
  },
];

analyzePlayerProgression(players);

console.log("\n🧪 Use Case 4: Testing");
console.log("━".repeat(50));

function testPlayerEquipment() {
  const testPlayer = engine
    .builder("TestPlayer")
    .set("State", "Awake")
    .set("Class", "Warrior")
    .set("Level", 10)
    .set("Enchanted", false)
    .increase("Strength")
    .by(15)
    .increase("Defense")
    .by(5)
    .build();

  const testBase = { Health: 50, Strength: 10, Speed: 8, Defense: 5 };
  const snapshot = toSnapshot(engine, testPlayer, testBase);

  // ✅ Easy assertions with predictable structure
  console.log("Test assertions:");
  console.log("✓ Name is TestPlayer:", snapshot.name === "TestPlayer");
  console.log("✓ Final strength is 25:", snapshot.metrics.Strength === 25); // 10 + 15
  console.log("✓ Final defense is 10:", snapshot.metrics.Defense === 10); // 5 + 5
  console.log("✓ Player is Warrior:", snapshot.Class === "Warrior");
  console.log("✓ Player is awake:", snapshot.State === "Awake");

  return snapshot;
}

console.log("\n🔄 Use Case 5: Caching");
console.log("━".repeat(50));

class PlayerCache {
  private cache = new Map<string, any>();

  getOrCompute(playerId: string, item: any, base: any) {
    if (this.cache.has(playerId)) {
      console.log(`Cache HIT for ${playerId}`);
      return this.cache.get(playerId);
    }

    console.log(`Cache MISS for ${playerId}, computing...`);
    // ✅ Expensive computation cached as flat structure
    const snapshot = toSnapshot(engine, item, base);
    this.cache.set(playerId, snapshot);
    return snapshot;
  }
}

const cache = new PlayerCache();
const player1 = cache.getOrCompute("player1", basicPlayer, baseStats);
const player1Again = cache.getOrCompute("player1", basicPlayer, baseStats); // Should hit cache

console.log("\n📤 Use Case 6: Export to CSV");
console.log("━".repeat(50));

function exportToCSV(players: Array<{ item: any; base: any }>) {
  const snapshots = players.map((p) => toSnapshot(engine, p.item, p.base));

  // ✅ Flat structure perfect for CSV
  const csvHeaders = [
    "name",
    "health",
    "strength",
    "speed",
    "defense",
    "state",
    "class",
    "level",
  ];
  const csvRows = snapshots.map((s) => [
    s.name,
    s.metrics.Health,
    s.metrics.Strength,
    s.metrics.Speed,
    s.metrics.Defense,
    s.State,
    s.Class,
    s.Level,
  ]);

  console.log("CSV Headers:", csvHeaders.join(","));
  csvRows.forEach((row) => console.log(row.join(",")));
}

exportToCSV(players);

console.log("\n✅ toSnapshot() Demo Complete!");
console.log("\n📝 Key Benefits:");
console.log("• Predictable, flat structure for any consumer");
console.log("• Type-safe access to all properties");
console.log("• Perfect for APIs, databases, caching, testing");
console.log("• Combines computed metrics with original attributes");
console.log("• Single function call gets everything you need");
