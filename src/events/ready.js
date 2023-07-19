const { Events } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        await mongoose.connect(process.env.MONGO_URI).then(() => {
            console.log('Connected to MongoDB'.green);
        }).catch((e) => {
            console.error(e);
        });
        
        // On bot ready.
        client.startTime = new Date().getTime();
        console.log(`Logged in as ${client.user.tag}`.green);
    }
};