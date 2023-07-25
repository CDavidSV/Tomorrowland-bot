const mongoose = require('mongoose');

const lineupScheema = new mongoose.Schema({
    artistName: {
        type: String,
        required: true
    },
    startTimestamp: {
        type: Number,
        required: true
    },
    endTimestamp: {
        type: Number,
        required: true
    },
    weekend: {
        type: Number,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    stream: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('lineup', lineupScheema);