const { MessageEmbed } = require("discord.js");


module.exports = { 
  info: {
        name: "Join",
        aliases: ["join"],
        description: "Join The Voice Channel!",
        usage: "Join",
    },
  run: async (client, message, args) => {
    
 if (!message.guild.me.voice.channel) {
            message.member.voice.channel.join();

            let thing = new MessageEmbed()
                .setColor(message.client.color)
                .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
                .setDescription("**Join** the voice channel.")
                .setFooter(`Request by: ${message.author.tag}`, message.author.displayAvatarURL());
            return message.channel.send(thing);
        } else {
            if (message.guild.me.voice.channel !== message.member.voice.channel) {
                let thing = new MessageEmbed()
                    .setColor("RED")
                    .setDescription(`You must be in the same channel as ${message.client.user}`);
                return message.channel.send(thing)
            }
        }
    }
}