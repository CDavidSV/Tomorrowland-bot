const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // On bot ready.
        client.startTime = new Date().getTime();
        console.log(`Logged in as ${client.user.tag}`.green);
    }
};