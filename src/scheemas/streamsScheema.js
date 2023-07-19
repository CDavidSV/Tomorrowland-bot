const mongoose = require('mongoose');

const streamsScheema = new mongoose.Schema({
    _id: String,
    streamUrl: {
        type: String,
        required: true
    },
    manifestUrl: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    channelTitle: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('streams', streamsScheema);