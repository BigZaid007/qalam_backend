const mongoose = require('mongoose');

const productScheme = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    description:
    {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 0
    },
    image: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    size: {
        type: [String],
        required: true
    },
    color: {
        type: [String],
        required: true
    },




},
    {
        timestamps: true
    }

)
const Product = mongoose.model('Product', productScheme)


module.exports = Product