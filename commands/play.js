const { play } = require("../include/play");
const ytdl = require("ytdl-core");
const createBar = require("string-progressbar");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader").default;
const https = require("https");
const { MessageEmbed } = require("discord.js");
const spotifyURI = require("spotify-uri");
const Spotify = require("node-spotify-api");
const { getTracks, getPreview } = require("spotify-url-info")

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
const spotify = new Spotify({
  id: process.env.SPOTIFY_CLIENT_ID,
  secret: process.env.SPOTIFY_SECRET_ID,
});
module.exports = {
    info: {
        name: "play",
       description: "To play music in the voice channel",
    usage: "[Song Name|Song URL]",
        aliases: ["p"],
   
    },
    run: async (client, message, args) => {
 
 const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);

    const requiredVC = new MessageEmbed()
      .setColor(0xda7272)
      .setAuthor(`${message.author.tag}`)
      .setTitle("Error!")
      .setDescription("Please join a voice channel before using this command")
      if (!channel) return message.channel.send(requiredVC).catch(console.error);
    if (serverQueue && channel !== message.guild.me.voice.channel) {
      const sameVC = new MessageEmbed()
        .setColor(0xda7272)
        .setTimestamp()
        .setAuthor(`${message.author.tag}`)
        .setTitle("Error!")
        .setDescription(
          `You must be in the same channel as ${message.client.user}`
        );

      return message.channel.send(sameVC).catch(console.error);
    }
    const argsThrow = new MessageEmbed()
      .setColor(0xda7272)
      .setTitle("Play")
      .setDescription(
        `Usage: play <YouTube URL | Spotify Song Link | Soundcloud URL>`
      );

    if (!args.length) return message.reply(argsThrow).catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) {
      const vcError = new MessageEmbed()
        .setColor(0xda7272)
        .setTimestamp()
        .setTitle("Voice Channel Error!")
        .setDescription(
          "Cannot connect to the voice channel, Missing Permissions"
        );

      return message.reply(vcError);
    }
    if (!permissions.has("SPEAK")) {
      const unableSpeak = new MessageEmbed()
        .setColor(0xda7272)
        .setTimestamp()
        .setAuthor(`${message.author.tag}`)
        .setTitle("Audio Error!")
        .setDescription(
          "I cannot speak in this voice channel, make sure I have the proper permissions"
        );

      return message.channel.send(unableSpeak);
    }

 const search = args.join(" ");
    const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
    const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
    const scRegex = /^https?:\/\/(soundcloud\.com)\/(.*)$/;
    const mobileScRegex = /^https?:\/\/(soundcloud\.app\.goo\.gl)\/(.*)$/;
    const spotifyPattern = /^.*(https:\/\/open\.spotify\.com\/track)([^#\&\?]*).*/gi;
    const spotifyValid = spotifyPattern.test(args[0]);
    const spotifyPlaylistPattern = /^.*(https:\/\/open\.spotify\.com\/playlist)([^#\&\?]*).*/gi;
    const spotifyPlaylistValid = spotifyPlaylistPattern.test(args[0]);
    const url = args[0];
    const urlValid = videoPattern.test(args[0]);

    // Start the playlist if playlist url was provided
    if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
      return message.client.commands.get("playlist").run(client,message, args);
    } else if (scdl.isValidUrl(url) && url.includes("/sets/")) {
      return message.client.commands.get("playlist").run(client,message, args);
    } else if (spotifyPlaylistValid) {
      return message.client.commands.get("playlist").run(client,message, args);
    }

    if (mobileScRegex.test(url)) {
      try {
        https.get(url, function (res) {
          if (res.statusCode == "302") {
            return message.client.commands
              .get("play")
              .run(client,message, [res.headers.location]);
          } else {
            return message
              .reply("No content could be found at that url.")
              .catch(console.error);
          }
        });
      } catch (error) {
        console.error(error);
        return message
          .reply(
            new MessageEmbed().setDescription(error.message).setColor("#da7272")
          )
          .catch(console.error);
      }
      return message.reply("Following url redirection...").catch(console.error);
    }

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true,
    };

    let songInfo = null;
    let song = null;

    if (spotifyValid) {
      let spotifyTitle, spotifyArtist;
      const spotifyTrackID = spotifyURI.parse(url).id;
      const spotifyInfo = await spotify
        .request(`https://api.spotify.com/v1/tracks/${spotifyTrackID}`)
        .catch((err) => {
          return message.channel.send(`Oops... \n` + err);
        });
      spotifyTitle = spotifyInfo.name;
      spotifyArtist = spotifyInfo.artists[0].name;

      try {
        const final = await youtube.searchVideos(
          `${spotifyTitle} - ${spotifyArtist}`,
          1,
          { part: "snippet" }
        );
        songInfo = await ytdl.getInfo(final[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
          thumbnail: songInfo.videoDetails.thumbnails[3].url,
          user: message.author,
        };
      } catch (err) {
        console.log(err);
        const throwErrSpotify = new MessageEmbed().setDescription(
          `Oops.. There was an error! \n` + err
        );
        return message.channel.send(throwErrSpotify);
      }
    } else if (urlValid) {
      try {
        songInfo = await ytdl.getInfo(url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: songInfo.videoDetails.lengthSeconds,
          thumbnail: songInfo.videoDetails.thumbnails[3].url,
          user: message.author,
        };
      } catch (error) {
        console.error(error);
        return message
          .reply(
            new MessageEmbed().setDescription(error.message).setColor("#da7272")
          )
          .catch(console.error);
      }
    } else if (scRegex.test(url)) {
      try {
        const trackInfo = await scdl.getInfo(url, SOUNDCLOUD_CLIENT_ID);
        song = {
          title: trackInfo.title,
          url: trackInfo.permalink_url,
          duration: Math.ceil(trackInfo.duration / 1000),
          thumbnail: trackInfo.artwork_url,
          user: message.author,
        };
      } catch (error) {
        console.error(error);
        return message
          .reply(
            new MessageEmbed().setDescription(error.message).setColor("#da7272")
          )
          .catch(console.error);
      }
    } else {
      try {
        const results = await youtube.searchVideos(search, 1);
        songInfo = await ytdl.getInfo(results[0].url);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          thumbnail: songInfo.videoDetails.thumbnails[3].url,
          duration: songInfo.videoDetails.lengthSeconds,
          user: message.author,
        };
      } catch (error) {
        console.error(error);
        return message
          .reply(
            new MessageEmbed().setDescription(error.message).setColor("#da7272")
          )
          .catch(console.error);
      }
    }
    const addedSongToQueue = new MessageEmbed()
      .setThumbnail(
        song.thumbnail ||
          "https://cdn.iconscout.com/icon/free/png-256/youtube-85-226402.png"
      )
      .setColor("#6ED590")     
      .setTitle("<a:yes:838026237255221318> • addedSong")
      .setDescription(`**[${song.title}](${song.url})**`);

    if (serverQueue) {
      serverQueue.songs.push(song);
      return serverQueue.textChannel
        .send(addedSongToQueue)
        .catch(console.error);
    }

    queueConstruct.songs.push(song);
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      queueConstruct.connection = await channel.join();
      await queueConstruct.connection.voice.setSelfDeaf(true);
      play(queueConstruct.songs[0], message);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();

      const unableJoin = new MessageEmbed()
        .setColor(0xda7272)
        .setTimestamp()
        .setTitle("Error!")
        .setDescription(`Could not join join the channel: ${error}`);

      return message.channel.send(unableJoin).catch(console.error);
    }
  },
}