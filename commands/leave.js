const { MessageEmbed } = require("discord.js");


module.exports = {
    info: {
        name: "leave",
        aliases: ["disconnect","dc", "stop"],
        description: "Leave The Voice Channel!",
        usage: "Leave",
    },
run: async (client, message, args) => {
const queue = message.client.distube.getQueue(message);

        if(!queue) {
            message.member.voice.channel.leave();
        } else {
	    message.client.distube.stop(message);
	    message.member.voice.channel.leave();
	}

        let thing = new MessageEmbed()
            .setColor(message.client.color)
            .setAuthor(message.client.user.username, message.client.user.displayAvatarURL())
            .setDescription("**Leave** the voice channel.")
            .setFooter(`Request by: ${message.author.tag}`, message.author.displayAvatarURL());
        return message.channel.send(thing);
    }
}