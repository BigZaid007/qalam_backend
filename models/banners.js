const mongoose = require('mongoose');

const banners = mongoose.Schema({

    bannerImg:
    {
        type: String,
        require: true,
    },

    bannerLink:
    {
        type: String,
        require: true,

    },
    bannerTitle:
    {
        type: String,
        require: true,

    },
    bannerOrder:
    {
        type: Number,
        require: true,
        default: 1
    }



});

const bannerModel = mongoose.model('banner', banners);

module.exports = bannerModel;