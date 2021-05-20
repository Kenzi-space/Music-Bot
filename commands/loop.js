const { canModifyQueue } = require("../include/EvobotUtil");
const { MessageEmbed } = require("discord.js");



module.exports = {
  info: {
    name: "loop",
    description: "Toggle music loop",
    usage: "loop",
    aliases: ["l"],
  },
run: async (client, message, args) => {
 const queue = message.client.queue.get(message.guild.id);

    const emptyQueue = new MessageEmbed()
      .setColor(0xda7272)
      .setTitle("Empty Queue")
      .setDescription("There is nothing playing");

    if (!queue) return message.reply(emptyQueue);
    if (!canModifyQueue(message.member)) return;

    queue.loop = !queue.loop;
    const loop = new MessageEmbed()
      .setColor(message.guild.me.displayHexColor)
      .setTitle("Succes Loop")
      .setDescription(
        `Loop is now set to ${queue.loop ? "**on**" : "**off**"}`
      );
    return queue.textChannel.send(loop);
  },
}