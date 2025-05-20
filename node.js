// mongo-connect.js

const { MongoClient, ServerApiVersion } = require('mongodb');

// 🔐 Replace with your actual MongoDB Atlas password
const uri = "mongodb+srv://ownwon3:YOUR_ACTUAL_PASSWORD@wonown.fdm3duz.mongodb.net/?retryWrites=true&w=majority&appName=wonown";

// Create a MongoClient with the Stable API version settings
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect to the MongoDB server
    await client.connect();

    // Test the connection with a ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. Successfully connected to MongoDB!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    // Always close the client after operation
    await client.close();
  }
}

// Run the connection test
run();
