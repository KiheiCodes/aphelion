const { bot } = require("../../index")
const wait = require('util').promisify(setTimeout);

module.exports = {
    name: 'ghostping',
    description: 'Ghost ping a user!',
    aliases: ['gp', 'ghost'],
    usage: '[user mention / ID]',
    cooldown: 0,
    oc: true,
    execute(message, args) {
        (async () => {
            if (!bot.isChick3n(message.author.id)) return
            if (!args[0]) return message.channel.send('You must include a user to ping!')

            message.delete();
            message.channel.send(`<@!${args[0].trim().replace('<', '').replace('@', '').replace('!', '').replace('>', '')}>`).then(msg => { msg.delete(); })
        })();
    }
}