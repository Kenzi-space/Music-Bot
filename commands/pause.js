const { canModifyQueue } = require("../include/EvobotUtil");
const { MessageEmbed } = require("discord.js");



module.exports = {
  info: {
    name: "pause",
    description: "To pause the current music in the server",
    usage: "[pause]",
    aliases: ["pause"],
  },
run: async(client, message ,args) => {
 const queue = message.client.queue.get(message.guild.id);
    const emptyQueue = new MessageEmbed()
      .setColor(0xda7272)
      .setTimestamp()
      .setTitle("Empty Queue")
      .setDescription("There is nothing playing");

    if (!queue) return message.reply(emptyQueue).catch(console.error);
    if (!canModifyQueue(message.member)) return;

    if (queue.playing) {
      queue.playing = false;
      queue.connection.dispatcher.pause(true);
      const paused = new MessageEmbed()
        .setColor(message.guild.me.displayHexColor)
        .setTimestamp()
        .setTitle("Succes Paused")
        .setDescription(`${message.author} ⏸ paused the music`);

      return queue.textChannel.send(paused).catch(console.error);
    }
  },
};