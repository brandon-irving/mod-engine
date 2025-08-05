#!/usr/bin/env node

/**
 * Simple demo script to verify the Next.js example works with mod-engine
 * This demonstrates server-side usage of the library
 */

import { rpgEngine } from "../lib/engine-config.js";

console.log("🛡️ Mod-Engine Next.js Example - Server Demo\n");

// Create a sample item to verify everything works
const demoItem = rpgEngine
  .builder("Demo Sword")
  .set("ItemName", "Demo Sword")
  .set("Rarity", "Epic")
  .set("Tags", ["Weapon"])
  .set("Level", 50)
  .set("Enchanted", true)
  .set("Quality", 80)
  .set("Cursed", false)
  .set("SocketCount", 2)
  .increase("Damage")
  .by(100)
  .when({ op: "eq", attr: "Enchanted", value: true })
  .multiply("Damage")
  .by(1.25)
  .build();

// Evaluate the item
const result = rpgEngine.evaluate(demoItem);

console.log("✅ Successfully created and evaluated demo item!");
console.log("📊 Final Metrics:", result.metrics);
console.log("🔧 Applied Modifiers:", result.applied.length);

// Validate the item
const validation = rpgEngine.validateItem(demoItem);
console.log("✅ Validation:", validation.ok ? "PASSED" : "FAILED");

console.log("\n🚀 The Next.js example is ready to use!");
console.log("💡 Run `npm run dev` to start the development server");
