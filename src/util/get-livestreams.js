const axios = require('axios');
const YTClass = require('../classes/YTLive.js');
const streamsScheema = require('../scheemas/streamsScheema.js');
const { Collection } = require('discord.js');

const APIKEY = process.env.GOOGLE_API_KEY

const getLiveStreams = async () => {
    // Query the DB for updated livestreams.
    const response = await streamsScheema.find({ channelTitle: 'Tomorrowland' }).then((res) => res).catch((err) => null);

    if (!response) return [];

    const liveStreams = new Collection();
    response.forEach((liveStream) => {
        liveStreams.set(liveStream._id, new YTClass(liveStream._id, liveStream.title, liveStream.thumbnail, liveStream.channelTitle, liveStream.manifestUrl));
    });

    return liveStreams;
}

module.exports = getLiveStreams;