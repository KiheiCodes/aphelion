const { bot } = require("../../exports")

function clean(text) {
    if (typeof (text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

module.exports = {
    name: 'eval',
    description: 'UHH',
    usage: '',
    cooldown: 0,
    od: true,
    execute(message, args) {
        (async () => {
        if (message.author.id !== '252980043511234560') return;

        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            message.channel.send(clean(evaled), { code: "xl" });
        } catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    })();
    }
}