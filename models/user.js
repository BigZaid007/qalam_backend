const mongoose = require('mongoose');

const user = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    token: {
        type: String,
        default: ''
    }
})

const userModel = mongoose.model('user', user);

module.exports = userModel;