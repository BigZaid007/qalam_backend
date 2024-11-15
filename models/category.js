const mongoose = require('mongoose');

const category = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category_id: {
        type: Number,
        required: true,
        unique: true,

    },
    image: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    }
});

const categoryModel = mongoose.model('category', category);

module.exports = categoryModel;