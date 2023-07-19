module.exports = class YTClass {
    constructor(videoId, title, thumbnail, channelTitle, manifestUrl) {
        this.videoId = videoId;
        this.title = title;
        this.thumbnail = thumbnail;
        this.channelTitle = channelTitle;
        this.manifestUrl = manifestUrl;
    }

    // Getters
    getVideoId() {
        return this.videoId;
    }

    getTitle() {
        return this.title;
    }

    getThumbnail() {
        return this.thumbnail;
    }

    getChannelTitle() {
        return this.channelTitle;
    }

    getManifestUrl() {
        return this.manifestUrl;
    }
}