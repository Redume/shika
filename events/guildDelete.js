const pool = require("../postgresql");
module.exports = async(client, guild) => {
    await pool.query("DELETE FROM guild WHERE guild_id = $1", [guild.id])
}