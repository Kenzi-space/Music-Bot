const { MessageEmbed } = require("discord.js");

const { canModifyQueue } = require("../include/EvobotUtil");



module.exports = {
  info: {
    name: "skip",
    description: "To skip the current music",
    usage: "",
    aliases: ["s"],
  },

  run: async(client, message , args) => {
     const queue = message.client.queue.get(message.guild.id);
        if (!queue)
            return message
                .reply("There is nothing playing that I could skip for you.")
                .catch(console.error);
        if (!canModifyQueue(message.member)) return;
        const skipEmbed = new MessageEmbed()
            .setColor(message.guild.me.displayHexColor)
            .setTitle("Succes Skipped")
            .setDescription(`${message.author} ⏭ skipped the song`);

        queue.playing = true;
        queue.connection.dispatcher.end();
        queue.textChannel.send(skipEmbed).catch(console.error);
    },
};