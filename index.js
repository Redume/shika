const { GatewayIntentBits, Client, Collection } = require('discord.js');
const fs = require("fs");
const yaml = require("yaml");
const client = new Client({allowedMentions: { parse: [], repliedUser: false },
        intents: [GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers] });

client.commands = new Collection();
client.aliases = new Collection();
client.slash = new Collection();
client.slashArray = [];

const config = yaml.parse(fs.readFileSync('./config.yaml', 'utf8'))

require("./function/logger")();

["commands", "slash", "events"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.login(config.token)
