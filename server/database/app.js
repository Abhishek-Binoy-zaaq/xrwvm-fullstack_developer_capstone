const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

// Load local JSON data
const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

// MongoDB Connection
mongoose.connect("mongodb://mongo_db:27017/", { 'dbName': 'dealershipsDB' });

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Initialize Database with Data
// Using an async function to ensure data is loaded properly
const initDB = async () => {
    try {
        await Reviews.deleteMany({});
        await Reviews.insertMany(reviews_data['reviews']);
        console.log("Reviews initialized");

        await Dealerships.deleteMany({});
        await Dealerships.insertMany(dealerships_data['dealerships']);
        console.log("Dealerships initialized");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};
initDB();

// --- ROUTES ---

// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews for dealer' });
    }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
        const documents = await Dealerships.find();
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships' });
    }
});

// Express route to fetch dealerships by a specific state
// Updated route to fetch dealerships by a specific state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
      // We use a case-insensitive regex to make it easier to find "Kansas"
      const documents = await Dealerships.find({ state: new RegExp(req.params.state, 'i') });
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching dealerships by state' });
    }
  });
  
  // Updated route to fetch a single dealer by ID
  app.get('/fetchDealer/:id', async (req, res) => {
    try {
      // Ensure the ID is treated as a number
      const dealerId = parseInt(req.params.id);
      const documents = await Dealerships.find({ id: dealerId });
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching dealer by ID' });
    }
  });

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
    try {
        const data = JSON.parse(req.body);
        const documents = await Reviews.find().sort({ id: -1 });
        let new_id = documents[0]['id'] + 1;

        const review = new Reviews({
            "id": new_id,
            "name": data['name'],
            "dealership": data['dealership'],
            "review": data['review'],
            "purchase": data['purchase'],
            "purchase_date": data['purchase_date'],
            "car_make": data['car_make'],
            "car_model": data['car_model'],
            "car_year": data['car_year'],
        });

        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});