const pool = require("../postgresql")
module.exports = async(client, guild) => {
    await pool.query("INSERT INTO guild (guild_id, prefix) VALUES ($1, $2) RETURNING *", [guild.id, "s."])
}