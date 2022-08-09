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

        await interaction.member.getData(interaction.member.id, interaction.guild.id);
        await interaction.guild.getData(interaction.guild.id);

        try {
            command.run(client, interaction, args)
        } catch (error) {
            console.log(error)
        }
    }
}