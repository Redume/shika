const { InteractionType } = require("discord.js")
const pool = require("../postgresql");
module.exports = async (client, interaction) => {
    if(interaction.type === InteractionType.ApplicationCommand) {
        const command = client.slash.get(interaction.commandName);
        if (!command) return interaction.reply({content: 'Что-то пошло не так', ephemeral: true});

        const args = [];
        for (let option of interaction.options.data) {
            if (option.type === 'SUB_COMMAND') {
                if (option.name) args.push(option.name);
                option.options?.forEach(x => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }

        await pool.query(`SELECT * FROM person WHERE guild_id = $1`, [interaction.guildId], async (err, result) => {
            if (interaction.user.id.includes(result.rows)) await pool.query(
                "INSERT INTO person (user_id, guild_id) VALUES ($1, $2) RETURNING *",
                [
                    interaction.user.id, interaction.guildId
                ]
            );
        })

        await pool.query(`SELECT * FROM guild WHERE guild_id = $1`, [interaction.guildId], async (err, result) => {
            if (interaction.guildId.includes(result.rows)) await pool.query(
                "INSERT INTO guild (guild_id) VALUES ($1) RETURNING *",
                [
                    interaction.guildId
                ]
            );
        })

        try {
            command.run(client, interaction, args)
        } catch (error) {
            console.log(error)
        }
    }
}