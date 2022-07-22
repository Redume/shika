const pg = require('pg')
const pool = new pg.Pool({
    user: "DATABASE_USERNAME",
    password: "DATABASE_PASSWORD",
    host: "DATABASE_HOST",
    port: 5432,
    database: "DATABASE_NAME"
})

module.exports = pool