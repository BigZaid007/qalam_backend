const express = require('express');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const category = require('../models/category');
const getNextCategoryId = require('../utils/autoIncremental');
const { createClient } = require('@supabase/supabase-js');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Supabase client setup
const supabaseUrl = "https://mvrbtgjavvyajupcpkbd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12cmJ0Z2phdnZ5YWp1cGNwa2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNDcyOTgsImV4cCI6MjA0NjkyMzI5OH0.Bea1f0Ig-XFgMU2PbfSguhQoPpY1h-KW_sMhiZtkUrE";
const supabase = createClient(supabaseUrl, supabaseKey);



const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Endpoint to get all categories
router.get('/getAllCategories', async (req, res) => {
    try {
        const categories = await category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving categories', error });
    }
});

// Endpoint to get a category by category_id
router.get('/getCategoryById/:id', async (req, res) => {
    try {
        const categoryById = await category.findOne({ category_id: req.params.id });
        if (!categoryById) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(categoryById);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving category', error });
    }
});

// Endpoint to add a new category
router.post('/addCategory', upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            const fileName = `${Date.now()}_${req.file.originalname}`;
            const filePath = `images/${fileName}`;

            const { data, error } = await supabase
                .storage
                .from('category_img')
                .upload(filePath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: req.file.mimetype
                });

            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error('Failed to upload image to storage');
            }

            const { data: publicUrlData } = await supabase
                .storage
                .from('category_img')
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new Error('Failed to generate public URL for uploaded image');
            }

            req.body.image = publicUrlData.publicUrl;
            console.log('Image URL saved:', publicUrlData.publicUrl);
        }

        const categoryId = await getNextCategoryId();

        const newCategory = await category.create({
            ...req.body,
            category_id: categoryId
        });

        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Error adding category', error });
    }
});

// Serve the HTML form for adding a new category
router.get('/upload-category', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/addCategory.html'));
});

module.exports = router;
