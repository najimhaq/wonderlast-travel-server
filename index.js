const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const errorMiddleware = require('./middleware/errorMiddleware');
const asyncHandler = require('./middleware/asyncHandler');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

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
    bookingCollection = db.collection('bookings');

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB!');

    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return false;
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Home page is running');
});

// Get all destinations route
app.get(
  '/destination',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const destinations = await destinationCollection.find({}).toArray();

    res.status(200).json({
      success: true,
      data: destinations,
      message: 'Destinations retrieved successfully',
    });
  })
);

// Get destination by ID route
app.get(
  '/destination/:id',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const { id } = req.params;
    const destination = await destinationCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
      message: 'Destination retrieved successfully',
    });
  })
);

// Create destination route
app.post(
  '/destination',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const destinationData = req.body;

    // Basic validation
    if (!destinationData.destinationName || !destinationData.country) {
      return res.status(400).json({
        success: false,
        message:
          'Missing required fields: destinationName and country are required',
      });
    }

    console.log('Received destination:', destinationData);

    // Add timestamps
    const enrichedData = {
      ...destinationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await destinationCollection.insertOne(enrichedData);

    res.status(201).json({
      success: true,
      data: {
        id: result.insertedId,
        ...enrichedData,
      },
      message: 'Destination created successfully',
    });
  })
);

// Bulk insert route
app.post(
  '/destination/all',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const destinations = await destinationCollection.insertMany(req.body);

    res.status(200).json({
      success: true,
      data: destinations,
      message: 'Destinations created successfully',
    });
  })
);

// Update destination route
app.patch(
  '/destination/:id',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const result = await destinationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
    });
  })
);

// Delete destination route
app.delete(
  '/destination/:id',
  asyncHandler(async (req, res) => {
    if (!destinationCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const { id } = req.params;
    const result = await destinationCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully',
    });
  })
);
//Booking Data get route
app.post(
  '/booking',
  asyncHandler(async (req, res) => {
    if (!bookingCollection) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
      });
    }

    const bookingData = req.body;

    const bookingResult = await bookingCollection.insertOne(bookingData);

    return res.status(201).json({
      success: true,
      data: bookingResult,
      message: 'Booking created successfully',
    });
  })
);

//error handling middleware
app.use(errorMiddleware);

// Start server
async function startServer() {
  const isConnected = await connectToDatabase();

  if (!isConnected) {
    console.error('Cannot start server without database connection');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await client.close();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

startServer();
