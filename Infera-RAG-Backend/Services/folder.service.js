const pool = require("../Config/db");
const AppError = require("../utils/AppError");

const UNIQUE_VIOLATION = "23505";

const SELECT_FOLDER = `
  SELECT f.id, f.name, f.description, f.created_at, f.updated_at,
         (SELECT count(*)::int
            FROM documents d
           WHERE d.folder_id = f.id
             AND d.organization_id = f.organization_id) AS document_count,
         (SELECT COALESCE(json_agg(u.name), '[]'::json)
            FROM folder_permissions fp
            JOIN users u ON u.id = fp.user_id
           WHERE fp.folder_id = f.id) AS members
    FROM folders f
`;

function toFolder(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    documentCount: row.document_count || 0,
    members: row.members || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeDescription(value) {
  return value === undefined || value === null || value === "" ? null : value;
}

async function resolveUserIds(organizationId, memberIdentifiers) {
  if (!memberIdentifiers || memberIdentifiers.length === 0) return [];
  const userIds = [];
  for (const item of memberIdentifiers) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      userIds.push(trimmed);
    } else {
      const res = await pool.query(
        `SELECT u.id FROM users u
         JOIN organization_members m ON m.user_id = u.id
         WHERE m.organization_id = $1 AND (LOWER(u.email) = LOWER($2) OR LOWER(u.name) = LOWER($2))`,
        [organizationId, trimmed]
      );
      if (res.rowCount > 0) {
        userIds.push(res.rows[0].id);
      }
    }
  }
  return [...new Set(userIds)];
}

async function syncFolderPermissions(organizationId, folderId, memberIdentifiers, grantedBy) {
  if (!Array.isArray(memberIdentifiers)) return;
  const userIds = await resolveUserIds(organizationId, memberIdentifiers);

  await pool.query(
    "DELETE FROM folder_permissions WHERE folder_id = $1 AND organization_id = $2",
    [folderId, organizationId]
  ).catch(() => {});

  for (const uid of userIds) {
    await pool.query(
      `INSERT INTO folder_permissions (organization_id, folder_id, user_id, permission, granted_by)
       VALUES ($1, $2, $3, 'view', $4)
       ON CONFLICT (folder_id, user_id) DO NOTHING`,
      [organizationId, folderId, uid, grantedBy]
    ).catch(() => {});
  }
}

async function getFolderRow(organizationId, folderId) {
  const { rows } = await pool.query(
    `${SELECT_FOLDER}
      WHERE f.id = $1 AND f.organization_id = $2 AND f.parent_folder_id IS NULL`,
    [folderId, organizationId]
  );
  return rows[0];
}

async function createFolder({ organizationId, userId, name, description, members }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO folders (organization_id, name, description, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, description, created_at, updated_at`,
      [organizationId, name, normalizeDescription(description), userId]
    );

    const folder = rows[0];
    if (members && members.length > 0) {
      await syncFolderPermissions(organizationId, folder.id, members, userId);
    }

    return toFolder(await getFolderRow(organizationId, folder.id));
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new AppError(409, "CONFLICT", "A folder with this name already exists");
    }
    throw err;
  }
}

async function listFolders({ organizationId, search }) {
  const values = [organizationId];
  let filter = "";
  if (search) {
    values.push(search);
    filter = "AND position(lower($2) in lower(f.name)) > 0";
  }
  const { rows } = await pool.query(
    `${SELECT_FOLDER}
      WHERE f.organization_id = $1 AND f.parent_folder_id IS NULL ${filter}
      ORDER BY lower(f.name)`,
    values
  );
  return rows.map(toFolder);
}

async function updateFolder({ organizationId, folderId, name, description, members, userId }) {
  const sets = [];
  const values = [];
  if (name !== undefined) {
    values.push(name);
    sets.push(`name = $${values.length}`);
  }
  if (description !== undefined) {
    values.push(normalizeDescription(description));
    sets.push(`description = $${values.length}`);
  }
  values.push(folderId);
  const idPos = values.length;
  values.push(organizationId);
  const orgPos = values.length;

  try {
    if (sets.length > 0) {
      const result = await pool.query(
        `UPDATE folders
            SET ${sets.join(", ")}, updated_at = now()
          WHERE id = $${idPos}
            AND organization_id = $${orgPos}
            AND parent_folder_id IS NULL`,
        values
      );
      if (result.rowCount === 0) {
        throw new AppError(404, "NOT_FOUND", "Folder not found");
      }
    }

    if (members !== undefined) {
      await syncFolderPermissions(organizationId, folderId, members, userId);
    }
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new AppError(409, "CONFLICT", "A folder with this name already exists");
    }
    throw err;
  }

  return toFolder(await getFolderRow(organizationId, folderId));
}

async function deleteFolder({ organizationId, folderId }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const folder = await client.query(
      `SELECT id FROM folders
        WHERE id = $1 AND organization_id = $2
        FOR UPDATE`,
      [folderId, organizationId]
    );
    if (folder.rowCount === 0) {
      throw new AppError(404, "NOT_FOUND", "Folder not found");
    }

    const docs = await client.query(
      `SELECT count(*)::int AS n FROM documents
        WHERE folder_id = $1 AND organization_id = $2`,
      [folderId, organizationId]
    );
    const children = await client.query(
      `SELECT count(*)::int AS n FROM folders
        WHERE parent_folder_id = $1 AND organization_id = $2`,
      [folderId, organizationId]
    );
    if (docs.rows[0].n > 0 || children.rows[0].n > 0) {
      throw new AppError(
        422,
        "FOLDER_NOT_EMPTY",
        "Folder is not empty. Remove its documents first."
      );
    }

    await client.query(
      "DELETE FROM folders WHERE id = $1 AND organization_id = $2",
      [folderId, organizationId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createFolder,
  listFolders,
  updateFolder,
  deleteFolder,
  syncFolderPermissions,
};
