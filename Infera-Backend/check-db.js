
const { pool } = require("./config/db");

async function checkDatabase() {
    try {
        const result = await pool.query(`
            SELECT
                current_database() AS database,
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM organizations) AS total_organizations,
                (SELECT COUNT(*) FROM organization_members) AS total_memberships,
                (
                    SELECT id
                    FROM organizations
                    WHERE id = 'f3d1d933-a03a-4fee-acbb-c42d92ff0691'
                ) AS expected_organization_id
        `);

        console.log("Database verification:");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("Database check failed:", error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
