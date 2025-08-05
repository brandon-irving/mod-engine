#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Path to the Next.js example
const exampleDir = path.join(__dirname, "..", "examples", "nextjs-example");
const nodeModulesPath = path.join(exampleDir, "node_modules");

console.log("🛡️ Starting mod-engine Next.js example...\n");

// Check if the example directory exists
if (!fs.existsSync(exampleDir)) {
  console.error("❌ Next.js example directory not found!");
  console.error("Expected at: examples/nextjs-example/");
  process.exit(1);
}

// First, build the mod-engine package if dist doesn't exist
const parentDir = path.join(__dirname, "..");
const distPath = path.join(parentDir, "dist");

if (!fs.existsSync(distPath)) {
  console.log("🔨 Building mod-engine package...");
  try {
    process.chdir(parentDir);
    execSync("npm run build", { stdio: "inherit" });
    console.log("✅ mod-engine package built successfully!\n");
  } catch (error) {
    console.error("❌ Failed to build mod-engine package");
    process.exit(1);
  }
}

// Change to the example directory
process.chdir(exampleDir);

// Check if node_modules exists
if (!fs.existsSync(nodeModulesPath)) {
  console.log("📦 Installing dependencies...");
  try {
    execSync("npm install", { stdio: "inherit" });
    console.log("✅ Dependencies installed successfully!\n");
  } catch (error) {
    console.error("❌ Failed to install dependencies");
    process.exit(1);
  }
} else {
  console.log("✅ Dependencies already installed\n");
}

// Build and start the Next.js application
console.log("🔨 Building Next.js application...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build completed successfully!\n");
} catch (error) {
  console.error("❌ Build failed, falling back to development mode...\n");
  console.log("🚀 Starting Next.js development server...");
  console.log("💡 Visit http://localhost:3000 when ready\n");

  try {
    execSync("npm run dev", { stdio: "inherit" });
  } catch (devError) {
    console.error("❌ Failed to start development server");
    process.exit(1);
  }
  process.exit(0);
}

console.log("🚀 Starting Next.js production server...");
console.log("💡 Visit http://localhost:3000 when ready\n");

try {
  execSync("npm start", { stdio: "inherit" });
} catch (error) {
  console.error("❌ Failed to start production server");
  process.exit(1);
}
