const express = require('express');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();
const productModel = require('../models/product');
const { createClient } = require('@supabase/supabase-js');

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON;
const supabase = createClient(supabaseUrl, supabaseKey);


router.post('/addProducts', upload.single('image'), async (req, res) => {
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

router.get('/upload-product', (req, res) => {
    console.log(supabaseKey)
    console.log(supabaseUrl)

    res.sendFile(path.join(__dirname, '../views/form.html'));
});

module.exports = router;