const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildInvites, GatewayIntentBits.MessageContent], partials: [Partials.Channel] });

/** Settings **/
let prefix = '+';
let BotName = 'Aphelion';
const DJSVersion = '14.11.0';
const BotSupportLink = 'https://discord.gg/';
const BotDev = '252980043511234560';
/*
    git push heroku main:main
    heroku logs -n 50

    devMode: 0 = main, 1 = dev
*/

/* Token Handler (devMode) */
const { devMode, connectToMongo } = require('./config.json');
var token;
var MONGO_URI;
if (devMode) {
    const { dtoken, dMONGO_URI } = require('./dev-config.json');
    token = dtoken;
    MONGO_URI = dMONGO_URI;
    prefix += prefix;
    BotName += " Dev";
} else {
    // for running Aphelion on Heroku
    /*
    token = process.env.TOKEN;
    MONGO_URI = process.env.MONGO_URI;
    */
   
    // for running Aphelion on PC
    const { mtoken, dMONGO_URI } = require('./dev-config.json');
    token = mtoken;
    MONGO_URI = dMONGO_URI;
}

const { bot } = require('./exports');

// require('./invisdetection');

const fs = require('fs');
const mongoose = require('mongoose');
const data_store = require('data-store');
const { channel } = require('diagnostics_channel');
// const wait = require('util').promisify(setTimeout);

let settings = new data_store({ path: process.cwd() + '/settings.json' });

client.on('ready', async () => {
    if (connectToMongo) {
        await mongoose.connect(
            MONGO_URI,
            {
                keepAlive: true
            }
        ).then(async (mongoose) => {
            try {
                console.log('Connected to MongoDB!');
            } catch (error) {
                console.log(error);
            }
        })
    }

    console.log(`${BotName} is online! ${client.ws.ping}ms`);
    client.user.setPresence({ activities: [{ type: 'PLAYING', name: "with spliffey" }], status: 'online' });
});

module.exports = {
    ws: client.ws,
    prefix: prefix,
    BotName: BotName,
    BotDev: BotDev,
    BotSupportLink: BotSupportLink,
    DJSVersion: DJSVersion
}

// Event Handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Store commands in a Collection
client.commands = new Collection();
client.cooldowns = new Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// Command Handler
client.on('messageCreate', async message => {
    //client.channels.cache.forEach(c => {
        //console.log(c.name + ' (' + c.id + ')')
    //})

    /*
    if(message.author.id === '252980043511234560' && message.content[0] === "e" && message.content[1] === " ") {
        let general = client.channels.cache.get("1095727319781490750");
        let modchat = client.channels.cache.get("1096327407847358514");
        let lol = message.content.replace("e ", "")
        //console.log(lol)
        modchat.send(lol);
    }

    //let test = client.guilds.cache.get("1095727318925848656")
    let log_c = client.channels.cache.get("1130183878036959243")
    
    if (message.guild.id === '1095727318925848656') {
        console.log(message.channel.name)
        console.log(message.channel.id)
        log_c.send(`(#${message.channel.name}) **${message.author.username}#${message.author.discriminator}**: ${message.content}`)
    }
    */
    //gen.send("yes")
    //console.log(test)
    //console.log(mem)
    //test.members.unban("")
    
    if (!message.content.startsWith(prefix) || message.author.bot) return

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return

    const {
        cooldowns
    } = client;

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 0) * 1000;

    if (timestamps.has(message.author.id) && !bot.isKihei(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.channel.send(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
        }
    }

    timestamps.set(message.author.id, now);
    (() => timestamps.delete(message.author.id), cooldownAmount);

    if (!bot.isKihei(message.author.id)) {
        if (!command.odp) {
            if (command.od) return
        } else if (message.author.id !== '457643046268436482') return
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.log(error);
        message.channel.send('There was an error trying to execute that command!');
    }
});

//client.on('presenceUpdate', async message => {

//});

client.login(token);
