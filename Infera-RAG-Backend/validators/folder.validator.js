const { z } = require("zod");

// name column is varchar(150) in the folders table
const name = z.string().trim().min(1).max(150);
// 1000 is only a safety limit (the DB column is plain text)
const description = z.string().trim().max(1000);

const createFolderSchema = z.object({
  name,
  description: description.optional(),
  visibility: z.string().optional(),
  members: z.array(z.string()).optional(),
});

const updateFolderSchema = z
  .object({
    name: name.optional(),
    description: description.nullable().optional(),
    visibility: z.string().optional(),
    members: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.members !== undefined ||
      data.visibility !== undefined,
    {
      message: "At least one of name, description, or members is required",
    }
  );

const folderIdParamSchema = z.object({ id: z.string().uuid() });

const listFoldersQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
});

module.exports = {
  createFolderSchema,
  updateFolderSchema,
  folderIdParamSchema,
  listFoldersQuerySchema,
};
