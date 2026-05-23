const { MongoClient, ServerApiVersion } = require('mongodb');

// Create a MongoClient
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let destinationCollection;

// Database connection function
async function connectToDatabase() {
  try {
    await client.connect();
    const db = client.db('wonderlast');
    destinationCollection = db.collection('destinations');

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return false;
  }
}
module.exports = connectToDatabase;
