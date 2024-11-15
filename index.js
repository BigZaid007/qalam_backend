const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./controllers/authController'); // Import auth routes
const categoryRoutes = require('./controllers/categoryController');
const productRoutes = require('./controllers/productController');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URL;

app.use('/api/auth', authRoutes); // Use auth routes with /api/auth prefix
app.use('/api/category', categoryRoutes);
app.use('/api/product', productRoutes);

app.get('/', (req, res) => {
    res.send('Hello');
});

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB', error);
    });

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
