import pg from "pg";

export async function connPG() {
    const pool = new pg.Pool({
        host:       process.env.PGHOST,
        database:   process.env.PGDATABASE,
        user:       process.env.PGUSER,
        password:   process.env.PGPASSWORD,
    })
    const conn = await pool.connect()
    return conn
}

export default sql;
