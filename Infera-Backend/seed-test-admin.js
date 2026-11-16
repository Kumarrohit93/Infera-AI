
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { pool } = require("./config/db");

const ORGANIZATION_ID =
    "f3d1d933-a03a-4fee-acbb-c42d92ff0691";

async function seedAdmin() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Verify the existing organization.
        const org = await client.query(
            "SELECT id FROM organizations WHERE id = $1",
            [ORGANIZATION_ID]
        );

        if (org.rowCount !== 1) {
            throw new Error("Existing organization not found");
        }

        const name = "Test Admin";
        const email = "admin@test.com";
        const password = "InferaAdmin@2026";

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, passwordHash]
        );

        const user = userResult.rows[0];

        await client.query(
            `INSERT INTO organization_members
             (organization_id, user_id, role, status)
             VALUES ($1, $2, 'admin', 'active')`,
            [ORGANIZATION_ID, user.id]
        );

        await client.query("COMMIT");

        console.log("Admin account created successfully!");
        console.log({
            userId: user.id,
            name: user.name,
            email: user.email,
            organizationId: ORGANIZATION_ID,
            role: "admin",
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Seed failed:", error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedAdmin();
