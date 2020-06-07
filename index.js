
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const cron = require('cron');
require('dotenv').config();


const client = new Discord.Client();

const TOKEN = process.env.TOKEN;

const prefix = "!";

const version = "1.0";

let servers = {};

function callAnnouncement() {
    const embed = new Discord.MessageEmbed()
        .setColor('#008ed4')
        .setTitle('ANNOUNCEMENTS')
        .setAuthor("From the Mafia")
        .setDescription('1. UXSoc Apps are still running. Tap more people to apply. \n 2. We have a meeting this week! Please wait for further announcements')
        .setTimestamp();
    return embed;
}

client.on('ready', () => {
    console.log('UXSoc Bot' + " version " + version + " is now up and running <3");

    const morning = new cron.CronJob('0 0 9 * * 1-5', () => {
        const morningMessage = client.channels.cache.find(channel => channel.id === '714833144410538024');
        const morningEmbed = new Discord.MessageEmbed()
            .setColor('#008ed4')
            .setTitle('Good Morning UXers! Wishing @everyone a good day ahead :)')
            .setTimestamp()
        morningMessage.send(morningEmbed);
    });

    morning.start();

    const job = new cron.CronJob('0 0 12 * * 1,3,5', () => {
        const announcement = client.channels.cache.find(channel => channel.id === '714833144410538024');
        announcement.send(callAnnouncement());
    });

    job.start();


    const evening = new cron.CronJob('0 0 21 * * 1-5', () => {
        const eveningMessage = client.channels.cache.find(channel => channel.id === '714833144410538024');
        const eveningEmbed = new Discord.MessageEmbed()
            .setColor('#008ed4')
            .setTitle('Good Night UXers! Rest well and see you again tomorrow :)')
            .setTimestamp();
        eveningMessage.send(eveningEmbed);
    });

    evening.start();

})

client.on("guildMemberAdd", member => {
    member.send("Welcome to official Discord sever of User Experience Society '20-'21! Type in !help to any channel in the server to get started :)");
})

client.on('message', async message => {
    let args = message.content.substring(prefix.length).split(" ");

    if (message.channel.type == "dm") {
        return;
    }
    else {
        switch (args[0]) {
            case 'play':

                function play(connection, message) {
                    let server = servers[message.guild.id];

                    server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }));
                    server.dispatcher.on("finish", function () {
                        server.queue.shift()
                        if (server.queue[0]) {
                            play(connection, message)
                        }
                        else if (server.queue[0] >= 1) {
                            server.queue.push(args[1]);
                            message.channel.send("Added song to the queue!");
                        }
                        else {
                            connection.disconnect();
                        }
                    });
                }

                if (!args[1]) {
                    message.channel.send("Please provide a link!");
                    return;
                }
                if (!message.member.voice.channel) {
                    message.channel.send("Hi UXer! We can't jam with you if you are not in a voice channel. Tune-in now <3 :)");
                    return;
                }
                if (!servers[message.guild.id]) servers[message.guild.id] = {
                    queue: []
                }

                let server = servers[message.guild.id];
                server.queue.push(args[1]);
                if (!message.guild.voiceChannel) message.member.voice.channel.join().then(function (connection) {
                    play(connection, message);
                })

                break;

            case 'skip':
                server = servers[message.guild.id];
                if (server.dispatcher) server.dispatcher.end();
                message.channel.send("Awwww...Skipped song!")
                break;

            case 'stop':
                server = servers[message.guild.id];
                if (message.guild.voice.connection) {
                    for (let i = server.queue.length - 1; i >= 0; i--) {
                        server.queue.splice(i, 1);
                    }
                    server.dispatcher.end();
                    message.channel.send("Ended the jamming session! I will leave now :(")
                    console.log('stopped the queue');
                }
                else {
                    connection.disconnect();
                }
                break;

            case 'resume':
                server = servers[message.guild.id];
                server.dispatcher.resume();
                message.channel.send("Let's rock and roll!")
                break;

            case 'pause':
                server = servers[message.guild.id];
                server.dispatcher.pause();
                message.channel.send("Pausing the song now! Will wait for you to play it again hihi")
                break;

            case 'queue':
                server = servers[message.guild.id];
                let output = "";
                let count = 1;

                server.queue.forEach(function (entry) {
                    output = output + count + "." + entry + "\n";
                    count++;
                });
                message.channel.send("Songs in queue:" + "\n" + output);
                break;

            case 'announcements':
                message.channel.send(callAnnouncement());
                break;

            case 'help':
                const member = message.member.user.tag;
                const Embed = new Discord.MessageEmbed()
                    .setColor("#008ed4")
                    .setTitle('GENERAL')
                    .addFields(
                        { name: '!announcements', value: 'sends the current announcements of User Experience Society' },
                        { name: '!info', value: 'reveals something about me :)' },
                        { name: '!basics', value: 'shows a list of discords functionalities' },
                        { name: '!faqs', value: 'answers some questions in navigating our server' },
                    )
                    .setTimestamp();
                const Embed2 = new Discord.MessageEmbed()
                    .setColor("#008ed4")
                    .setTitle('PLAYING MUSIC')
                    .addFields(
                        { name: '!play <youtube link>', value: 'plays the audio of the selected video from youtube.' },
                        { name: '!pause', value: 'pauses current track on queue.' },
                        { name: '!skip', value: 'skips to the next song on queue.' },
                        { name: '!stop', value: 'stops every song on queue.' },
                        { name: '!queue', value: 'shows all track on queue' },
                    )
                    .setTimestamp();

                message.channel.send("Hi @" + member + "! Check your DMs :)");
                message.author.send("Hi @" + member + "! Here is the list of UXSoc Bot commands available!");
                message.author.send(Embed);
                message.author.send(Embed2);
                break;

            case 'basics':
                const member2 = message.member.user.tag;
                const help = new Discord.MessageEmbed()
                    .setColor("#008ed4")
                    .setTitle('DISCORD BASICS')
                    .addFields(
                        { name: 'Join a voice channel', value: 'Press the voice channel where you want to connect and click connect' },
                        { name: 'Leave a voice channel', value: 'Click disconnect button (red telephone icon w/ X)' },
                        { name: 'Share screen during call', value: 'Once connected to a voice channel, press the video button (camera icon)' },
                        {
                            name: 'Add a friend', value: 'For Mobile: \n1. Press waving person icon below.\n2. Click on add friend icon on top.'
                        },
                    )
                    .setTimestamp();

                message.channel.send("Hi @" + member2 + "! Check your DMs :)");
                message.author.send("Hi @" + member2 + "! Here are some instructions on how you can get started :)");
                message.author.send(help);
                break;

            case 'faqs':
                const member3 = message.member.user.tag;
                const help2 = new Discord.MessageEmbed()
                    .setColor("#008ed4")
                    .setTitle('FAQS')
                    .addFields(
                        { name: 'How do I ask for an IC?', value: 'Feel free to message any EB member directly!' },
                        { name: 'How do I raise a concern?', value: 'Message our helpdesk channel and I will notify EB members with your concern afterwards.' },
                        { name: 'How do I use UXSoc Bot?', value: 'Type in !help to check what he can do :)' },
                    )
                    .setTimestamp();

                message.channel.send("Hi @" + member3 + "! Check your DMs :)");
                message.author.send("Hi @" + member3 + "! Here some frequently asked questions in navigating our server:");
                message.author.send(help2);
                break;

            case 'info':
                const member4 = message.member.user.tag;
                message.channel.send("Hello there @" + member4 + "! I am UXSoc Bot version 1.0 :) \nType !help to get started.");
        }
    }
});

client.login(TOKEN);