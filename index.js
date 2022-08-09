const { GatewayIntentBits, Client, Collection, Guild, GuildMember } = require('discord.js');
const fs = require("fs");
const yaml = require("yaml");

const pool = require("./postgresql");

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

require("./utils/logger")();

Guild.prototype.getData = async function () {
    const data = await pool.query("SELECT * FROM guild WHERE guild_id = $1", [this.id]);
    if(!data) await pool.query("INSERT INTO guild (guild_id) VALUES ($1) RETURNING *", [this.id]);
    return data.rows[0];
};

GuildMember.prototype.getData = async function () {
    const data = await pool.query(
        "SELECT * FROM person WHERE user_id = $1 AND guild_id = $2",
        [
            this.user.id,
            this.guild.id
        ]
    );

    if(!data) await pool.query("INSERT INTO person (user_id, guild_id) VALUES ($1, $2) RETURNING *",
        [
            this.user.id,
            this.guild.id
        ]
    );
    return data.rows[0];
};

["commands", "slash", "events"].forEach(handler => {
    require(`./handler/${handler}`)(client);
});

client.login(config.token)
