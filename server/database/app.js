const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

// Load local JSON data
const reviews_data = JSON.parse(fs.readFileSync("./data/reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("./data/dealerships.json", 'utf8'));

// In-memory 'database'
const Reviews = reviews_data['reviews'];
const Dealerships = dealerships_data['dealerships'];

// --- ROUTES ---

// Express route to home
app.get('/', (req, res) => {
    res.send("Welcome to the API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', (req, res) => {
    try {
        res.json(Reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', (req, res) => {
    try {
        const dealerId = parseInt(req.params.id);
        const documents = Reviews.filter(review => review.dealership === dealerId);
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews for dealer' });
    }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', (req, res) => {
    try {
        res.status(200).json(Dealerships);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships' });
    }
});

// Express route to fetch dealerships by a specific state
app.get('/fetchDealers/:state', (req, res) => {
    try {
        const state = req.params.state.toLowerCase();
        const documents = Dealerships.filter(dealer => dealer.state.toLowerCase() === state);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealerships by state' });
    }
});

// Express route to fetch a single dealer by ID
app.get('/fetchDealer/:id', (req, res) => {
    try {
        const dealerId = parseInt(req.params.id);
        const document = Dealerships.find(dealer => dealer.id === dealerId);
        if (document) {
            res.status(200).json([document]); // Return array to match previous structure
        } else {
            res.status(404).json({ error: 'Dealer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching dealer by ID' });
    }
});

// Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), (req, res) => {
    try {
        const data = JSON.parse(req.body);
        // Find max id
        let max_id = 0;
        if (Reviews.length > 0) {
            max_id = Math.max(...Reviews.map(r => r.id));
        }
        let new_id = max_id + 1;

        const new_review = {
            "id": new_id,
            "name": data['name'],
            "dealership": data['dealership'],
            "review": data['review'],
            "purchase": data['purchase'],
            "purchase_date": data['purchase_date'],
            "car_make": data['car_make'],
            "car_model": data['car_model'],
            "car_year": data['car_year'],
        };

        Reviews.push(new_review);
        res.json(new_review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});