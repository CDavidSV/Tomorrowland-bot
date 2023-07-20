const mongoose = require('mongoose');
const streamsScheema = require('../scheemas/streamsScheema');
const youtubedl = require('youtube-dl-exec');
const yts = require('yt-search');

const getStreams = async () => {
    const results = await yts('tomorrowland live');
    //console.log(results.videos)
    return results.all.filter((result) => (result.type === 'video' || result.type === 'live') && result.seconds === 0 && result.author.name === 'Tomorrowland');
}

/**
 * Note: This function should be called before running the bot. (This is to update the streams data in the database before using the bot)
 * @param {*} once Specify if the function should only run once.
 */
const reloadStreams = async (once = false) => {
    const streams = await getStreams();

    try {
        console.log('Updating stream data...'.yellow);
        for (const [index, stream] of streams.entries()) {
            const streamData = await youtubedl(stream.url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
                preferFreeFormats: true,
                addHeader: [
                    'referer:youtube.com',
                    'user-agent:googlebot'
                ]
            });
    
            const validFormats = [91,92,93,94,95];
            const format = streamData.formats.find((format) => validFormats.includes(parseInt(format.format_id)));

            // These links are only valid for 6 hours.
            const manifestUrl = format.manifest_url;
            
            await streamsScheema.findByIdAndUpdate({ _id: stream.videoId }, {_id: stream.videoId, manifestUrl: manifestUrl, title: stream.title, channelTitle: stream.author.name, thumbnail: stream.thumbnail} , { upsert: true, new: true, setDefaultsOnInsert: true });
            console.log(`Stream ${index + 1}/${streams.length} updated`);
        }
    } catch (err) {
        console.error(`An error ocurred while updating stream data: ${err}`.red);
        console.log('Retrying in 1 minute...');
        setTimeout(reloadStreams, 60_000);
    }

    const threeHoursInMs = 1.08e+7;
    console.log('Stream data updated'.green);
    if (!once) {
        console.log(`Updating again at ${new Date(Date.now() + threeHoursInMs).toLocaleString()}`);

        setTimeout(reloadStreams, threeHoursInMs);
    }
}

module.exports = reloadStreams;