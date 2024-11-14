const express = require('express');
const mongoose = require('mongoose');
const productModel = require('./models/product');
const userModel = require('./models/user');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const authRoutes = require('./controllers/authController'); // Import auth routes

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = "mongodb+srv://admin:admin@cluster0.jty2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Supabase client setup
const supabaseUrl = "https://mvrbtgjavvyajupcpkbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmJ0Z2phdnZ5YWp1cGNwa2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNDcyOTgsImV4cCI6MjA0NjkyMzI5OH0.Bea1f0Ig-XFgMU2PbfSguhQoPpY1h-KW_sMhiZtkUrE";
const supabase = createClient(supabaseUrl, supabaseKey);

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use('/api/auth', authRoutes); // Use auth routes with /api/auth prefix

app.get('/', (req, res) => {
    res.send('Hello');
});

app.post('/api/users', async (req, res) => {
    try {
        const user = await userModel.create(req.body);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

app.get('/upload-product', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { size, color, ...rest } = req.body;

        const productData = {
            ...rest,
            size: size.split(',').map(item => item.trim()),
            color: color.split(',').map(item => item.trim())
        };

        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname}`;
            const filePath = `images/${fileName}`;

            const { data, error } = await supabase
                .storage
                .from('product_img')
                .upload(filePath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: req.file.mimetype
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error('Failed to upload image to storage');
            }

            const { data: { publicUrl } } = supabase
                .storage
                .from('product_img')
                .getPublicUrl(filePath);

            if (!publicUrl) {
                throw new Error('Failed to generate public URL for uploaded image');
            }

            productData.image = publicUrl;
            console.log('Image URL saved:', publicUrl);
        }

        const product = await productModel.create(productData);
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });

    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating product',
            error: error.stack
        });
    }
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
