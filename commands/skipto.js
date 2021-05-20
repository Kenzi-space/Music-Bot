const { canModifyQueue } = require("../include/EvobotUtil");
const { MessageEmbed } = require("discord.js");

module.exports = {
  info:{
  name: "skipto",
  aliases: ["st"],
  description: "Skip to the selected queue number",
  usage:"",
},
run: async(client, message , args) => {
  const noQa = new MessageEmbed()
      .setColor(0xd3d3d3)
      .setTitle("Usage")
      .setDescription(
        `${message.client.prefix}${module.exports.name} <Queue Number>`
      );

    if (!args.length || isNaN(args[0]))
      return message.reply(noQa).catch(console.error);

    const queue = message.client.queue.get(message.guild.id);

    const noQ = new MessageEmbed()
      .setColor(0xda7272)
      .setTitle("Empty Queue")
      .setDescription("There is nothing in the queue");

    if (!queue) return message.channel.send(noQ).catch(console.error);
    if (!canModifyQueue(message.member)) return;
    if (args[0] > queue.songs.length) {
      const noQw = new MessageEmbed()
        .setColor(0xda7272)
        .setTitle("Error!")
        .setDescription(`The queue is only ${queue.songs.length} songs long!`);

      return message.reply(noQw).catch(console.error);
    }
    queue.playing = true;

    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }

    queue.connection.dispatcher.end();

    const skipto = new MessageEmbed()
      .setColor(message.guild.me.displayHexColor)
      .setTitle("Succes Skipped!")
      .setDescription(`${message.author} skipped ${args[0] - 1} songs`);

    queue.textChannel.send(skipto).catch(console.error);
  },
};