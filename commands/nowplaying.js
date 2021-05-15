
const { MessageEmbed } = require("discord.js");
const createBar = require("string-progressbar");
module.exports = {
   
    info:{
    name: "nowplaying",
   
    aliases: ["np"],
  
    useage: "nowplaying",
    description: "Shows current Track information",
},
    run: async (client, message, args, cmduser, text, prefix) => {
   const queue = message.client.queue.get(message.guild.id);
        const emptyQueue = new MessageEmbed()
            .setColor("#6ED590")
            .setTitle("Empty Queue")
            .setDescription("There is nothing playing");

        if (!queue) return message.reply(emptyQueue).catch(console.error);
        const song = queue.songs[0];
        const seek =
            (queue.connection.dispatcher.streamTime -
                queue.connection.dispatcher.pausedTime) /
            1000;
        const left = song.duration - seek;

     let nowPlaying = new MessageEmbed()
.setDescription(`**[${song.title}](${song.url})**`)
            .setColor("#00FF00")
            .setThumbnail(`${song.thumbnail}`)
       if (song.duration > 0)
            nowPlaying.setFooter(
                "Time Remaining: " +
                    new Date(left * 1000).toISOString().substr(11, 8)
            );


        return message.channel.send(nowPlaying);
    },
}