const { MessageEmbed } = require("discord.js");
const { canModifyQueue } = require("../include/EvobotUtil");

module.exports = {
info:{
	name: "stop",
   
    description: "Stops the music",
  
    usage: "",
    aliases: [""],
},
run: async (client, message, args) => {
const queue = message.client.queue.get(message.guild.id);

        const embedA = new MessageEmbed()
            .setColor(0xda7272)
            .setTitle("Empty Queue")
            .setDescription("There is nothing in the queue");

        if (!queue) return message.reply(embedA).catch(console.error);
        if (!canModifyQueue(message.member)) return;

        queue.songs = [];
        queue.connection.dispatcher.end();

        const embedB = new MessageEmbed()
            .setColor("#6ED590")
            .setTitle("<a:yes:838026237255221318>•Succes Stopped!")
            .setDescription(`**${message.author}** stoped the music`);

        queue.textChannel.send(embedB).catch(console.error);
    },
}