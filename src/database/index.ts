import mongoose from "mongoose"

export async function setupMongo() {
  try {
    if (mongoose.connection.readyState === 1) {
      return
    }

    console.log("🎲 conecting to database...")
    await mongoose.connect("mongodb://localhost:27017/elitetracker", {
      serverSelectionTimeoutMS: 3000, // 3s
    })

    console.log("✅database conected")
  } catch {
    throw new Error("❌ Database not coneccted")
  }
}
