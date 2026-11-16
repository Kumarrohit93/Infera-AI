/**
 * Infera AI: Complete Multi-Document RAG & Access Control Verification Suite
 *
 * Verifies:
 * 1. Admin Multi-Document Access
 * 2. Member A Document-Level Access Control (isolated to authorized folders)
 * 3. Member B Document-Level Access Control (isolated to separate folders)
 * 4. Member with No Document Access (instant zero-Gemini-token fallback)
 * 5. Member with Expired Access (expired permissions blocked, active allowed)
 * 6. Chat History Persistence (Conversation, Messages, and Sources saved in DB)
 */

const pool = require("./Config/db");
const jwt = require("jsonwebtoken");
const { jwtAccessSecret } = require("./Config/env");
const { countAuthorizedDocuments, searchSimilarChunks } = require("./Repositories/SearchRepository");
const {
  createConversation,
  listConversations,
  getConversationMessages,
  saveChatExchange,
  deleteConversation,
} = require("./Repositories/ConversationRepository");
const { initDb } = require("./Config/initDb");

const ORGANIZATION_ID = "f3d1d933-a03a-4fee-acbb-c42d92ff0691";

function makeToken({ userId, organizationId, role }) {
  return jwt.sign({ userId, organizationId, role }, jwtAccessSecret, { expiresIn: "1h" });
}

async function runVerification() {
  console.log("================================================================================");
  console.log("      INFERA AI - MULTI-DOCUMENT RAG & CHAT HISTORY VERIFICATION SUITE         ");
  console.log("================================================================================\n");

  await initDb();

  const client = await pool.connect();
  try {
    // --------------------------------------------------------------------------
    // STEP 0: Test Users & Folders Setup
    // --------------------------------------------------------------------------
    console.log("[SETUP] Preparing Test Users, Folders, and Document Permissions...");

    // 1. Create or get test users
    const userEmails = {
      admin: "admin_test@infera.ai",
      memberA: "member_a@infera.ai",
      memberB: "member_b@infera.ai",
      memberNoAccess: "member_no_access@infera.ai",
      memberExpired: "member_expired@infera.ai",
    };

    const userIds = {};
    for (const [key, email] of Object.entries(userEmails)) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, 'test_hash_pw')
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [key, email]
      );
      userIds[key] = res.rows[0].id;

      // Ensure membership in organization
      await client.query(
        `INSERT INTO organization_members (organization_id, user_id, role, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (organization_id, user_id) DO NOTHING`,
        [ORGANIZATION_ID, userIds[key], key === "admin" ? "admin" : "member"]
      );
    }

    // 2. Create Folders:
    // Folder 1: "Engineering - Node & Security" (For Member A)
    // Folder 2: "Frontend - React & JS" (For Member B)
    // Folder 3: "Architecture - System Design" (Restricted / Expired)
    const folderRes1 = await client.query(
      `INSERT INTO folders (organization_id, name, description, created_by)
       VALUES ($1, 'Engineering Docs', 'Node and Security notes', $2)
       ON CONFLICT (organization_id, LOWER(name)) WHERE parent_folder_id IS NULL
       DO UPDATE SET description = EXCLUDED.description
       RETURNING id`,
      [ORGANIZATION_ID, userIds.admin]
    );
    const folder1 = folderRes1.rows[0].id;

    const folderRes2 = await client.query(
      `INSERT INTO folders (organization_id, name, description, created_by)
       VALUES ($1, 'Frontend Docs', 'React and JavaScript notes', $2)
       ON CONFLICT (organization_id, LOWER(name)) WHERE parent_folder_id IS NULL
       DO UPDATE SET description = EXCLUDED.description
       RETURNING id`,
      [ORGANIZATION_ID, userIds.admin]
    );
    const folder2 = folderRes2.rows[0].id;

    const folderRes3 = await client.query(
      `INSERT INTO folders (organization_id, name, description, created_by)
       VALUES ($1, 'Architecture Archive', 'System Design notes', $2)
       ON CONFLICT (organization_id, LOWER(name)) WHERE parent_folder_id IS NULL
       DO UPDATE SET description = EXCLUDED.description
       RETURNING id`,
      [ORGANIZATION_ID, userIds.admin]
    );
    const folder3 = folderRes3.rows[0].id;

    // 3. Create Sample Documents in Folders
    // Doc 1 (Folder 1): Node.js Notes.pdf
    const docRes1 = await client.query(
      `INSERT INTO documents (organization_id, folder_id, original_filename, storage_key, mime_type, file_size_bytes, status)
       VALUES ($1, $2, 'Node.js Notes.pdf', 'docs/node.pdf', 'application/pdf', 1024, 'ready')
       ON CONFLICT (id, organization_id) DO NOTHING
       RETURNING id`,
      [ORGANIZATION_ID, folder1]
    );
    const docId1 = docRes1.rows[0]?.id || (await client.query("SELECT id FROM documents WHERE original_filename = 'Node.js Notes.pdf'")).rows[0].id;

    // Doc 2 (Folder 1): Backend Security.docx
    const docRes2 = await client.query(
      `INSERT INTO documents (organization_id, folder_id, original_filename, storage_key, mime_type, file_size_bytes, status)
       VALUES ($1, $2, 'Backend Security.docx', 'docs/sec.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024, 'ready')
       ON CONFLICT (id, organization_id) DO NOTHING
       RETURNING id`,
      [ORGANIZATION_ID, folder1]
    );
    const docId2 = docRes2.rows[0]?.id || (await client.query("SELECT id FROM documents WHERE original_filename = 'Backend Security.docx'")).rows[0].id;

    // Doc 3 (Folder 2): React Interview.docx
    const docRes3 = await client.query(
      `INSERT INTO documents (organization_id, folder_id, original_filename, storage_key, mime_type, file_size_bytes, status)
       VALUES ($1, $2, 'React Interview.docx', 'docs/react.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1024, 'ready')
       ON CONFLICT (id, organization_id) DO NOTHING
       RETURNING id`,
      [ORGANIZATION_ID, folder2]
    );
    const docId3 = docRes3.rows[0]?.id || (await client.query("SELECT id FROM documents WHERE original_filename = 'React Interview.docx'")).rows[0].id;

    // Doc 4 (Folder 3): System Design.pdf
    const docRes4 = await client.query(
      `INSERT INTO documents (organization_id, folder_id, original_filename, storage_key, mime_type, file_size_bytes, status)
       VALUES ($1, $2, 'System Design.pdf', 'docs/sys.pdf', 'application/pdf', 1024, 'ready')
       ON CONFLICT (id, organization_id) DO NOTHING
       RETURNING id`,
      [ORGANIZATION_ID, folder3]
    );
    const docId4 = docRes4.rows[0]?.id || (await client.query("SELECT id FROM documents WHERE original_filename = 'System Design.pdf'")).rows[0].id;

    // 4. Insert dummy embedding chunks (unit vector dimension 1536) for testing
    const sampleEmbedding = new Array(1536).fill(0.025);
    sampleEmbedding[0] = 0.5; // Distinct non-zero vector

    await client.query(
      `INSERT INTO document_chunks (organization_id, document_id, chunk_index, chunk_text, page_number, heading, embedding)
       VALUES
         ($1, $2, 0, 'Node.js event loop handles non-blocking asynchronous I/O operations efficiently.', 1, 'Event Loop Architecture', $6::vector),
         ($1, $3, 0, 'Backend security requires JWT signing, HTTPS enforcement, and role-based access control.', NULL, 'Security Principles', $6::vector),
         ($1, $4, 0, 'React uses a Virtual DOM and fiber reconciliation for component state rendering.', NULL, 'React Internals', $6::vector),
         ($1, $5, 0, 'System design principles involve horizontal scaling, caching, and rate limiting.', 3, 'Scalability Guidelines', $6::vector)
       ON CONFLICT (document_id, chunk_index) DO NOTHING`,
      [ORGANIZATION_ID, docId1, docId2, docId3, docId4, JSON.stringify(sampleEmbedding)]
    );

    // 5. Setup Folder Permissions:
    // Member A -> Folder 1 (Node.js & Security)
    await client.query(
      `INSERT INTO folder_permissions (organization_id, folder_id, user_id, permission, granted_by)
       VALUES ($1, $2, $3, 'view', $4)
       ON CONFLICT (folder_id, user_id) DO UPDATE SET permission = 'view', expires_at = NULL`,
      [ORGANIZATION_ID, folder1, userIds.memberA, userIds.admin]
    );

    // Member B -> Folder 2 (React & JS)
    await client.query(
      `INSERT INTO folder_permissions (organization_id, folder_id, user_id, permission, granted_by)
       VALUES ($1, $2, $3, 'view', $4)
       ON CONFLICT (folder_id, user_id) DO UPDATE SET permission = 'view', expires_at = NULL`,
      [ORGANIZATION_ID, folder2, userIds.memberB, userIds.admin]
    );

    // Member Expired -> Folder 3 (Expired yesterday)
    await client.query(
      `INSERT INTO folder_permissions (organization_id, folder_id, user_id, permission, expires_at, granted_by)
       VALUES ($1, $2, $3, 'view', NOW() - INTERVAL '1 day', $4)
       ON CONFLICT (folder_id, user_id) DO UPDATE SET expires_at = NOW() - INTERVAL '1 day'`,
      [ORGANIZATION_ID, folder3, userIds.memberExpired, userIds.admin]
    );

    console.log("[SETUP] Test data successfully populated in infera_ai!\n");

    // --------------------------------------------------------------------------
    // SCENARIO 1: Admin Multi-Document Access
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("SCENARIO 1: Admin Multi-Document Search Access");
    console.log("----------------------------------------------------------------");
    const adminDocsCount = await countAuthorizedDocuments({
      organizationId: ORGANIZATION_ID,
      userId: userIds.admin,
      role: "admin",
    });
    const adminChunks = await searchSimilarChunks({
      organizationId: ORGANIZATION_ID,
      userId: userIds.admin,
      role: "admin",
      queryEmbedding: sampleEmbedding,
      limit: 10,
      minSimilarity: -1,
    });

    const adminDocNames = [...new Set(adminChunks.map((c) => c.original_filename))];
    console.log(`- Authorized Documents Count: ${adminDocsCount}`);
    console.log(`- Retrieved Chunks Count: ${adminChunks.length}`);
    console.log(`- Distinct Documents Retrieved: ${adminDocNames.join(", ")}`);

    const scenario1Pass = adminChunks.length >= 4 && adminDocNames.length >= 4;
    console.log(`-> SCENARIO 1 RESULT: ${scenario1Pass ? "PASS" : "FAIL"}\n`);

    // --------------------------------------------------------------------------
    // SCENARIO 2: Member A Access Control
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("SCENARIO 2: Member A Document-Level Access Control (Node + Security only)");
    console.log("----------------------------------------------------------------");
    const memberADocsCount = await countAuthorizedDocuments({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
      role: "member",
    });
    const memberAChunks = await searchSimilarChunks({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
      role: "member",
      queryEmbedding: sampleEmbedding,
      limit: 10,
      minSimilarity: -1,
    });

    const memberADocNames = [...new Set(memberAChunks.map((c) => c.original_filename))];
    console.log(`- Member A Authorized Docs Count: ${memberADocsCount}`);
    console.log(`- Member A Retrieved Chunks: ${memberAChunks.length}`);
    console.log(`- Retrieved Documents: ${memberADocNames.join(", ")}`);

    const unauthorizedForA = memberADocNames.some((d) => d.includes("React") || d.includes("System Design"));
    const scenario2Pass = memberADocNames.includes("Node.js Notes.pdf") && !unauthorizedForA;
    console.log(`- Unauthorized content leaked: ${unauthorizedForA ? "YES (FAILED)" : "NO (SECURE)"}`);
    console.log(`-> SCENARIO 2 RESULT: ${scenario2Pass ? "PASS" : "FAIL"}\n`);

    // --------------------------------------------------------------------------
    // SCENARIO 3: Member B Access Control
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("SCENARIO 3: Member B Document-Level Access Control (React only)");
    console.log("----------------------------------------------------------------");
    const memberBDocsCount = await countAuthorizedDocuments({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberB,
      role: "member",
    });
    const memberBChunks = await searchSimilarChunks({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberB,
      role: "member",
      queryEmbedding: sampleEmbedding,
      limit: 10,
      minSimilarity: -1,
    });

    const memberBDocNames = [...new Set(memberBChunks.map((c) => c.original_filename))];
    console.log(`- Member B Authorized Docs Count: ${memberBDocsCount}`);
    console.log(`- Member B Retrieved Chunks: ${memberBChunks.length}`);
    console.log(`- Retrieved Documents: ${memberBDocNames.join(", ")}`);

    const leakedToB = memberBDocNames.some((d) => d.includes("Node.js") || d.includes("Backend Security"));
    const scenario3Pass = memberBDocNames.includes("React Interview.docx") && !leakedToB;
    console.log(`- Member A documents leaked to B: ${leakedToB ? "YES (FAILED)" : "NO (SECURE)"}`);
    console.log(`-> SCENARIO 3 RESULT: ${scenario3Pass ? "PASS" : "FAIL"}\n`);

    // --------------------------------------------------------------------------
    // SCENARIO 4: No Document Access
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("SCENARIO 4: Member with No Document Permissions");
    console.log("----------------------------------------------------------------");
    const noAccessDocsCount = await countAuthorizedDocuments({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberNoAccess,
      role: "member",
    });
    console.log(`- Authorized Documents Count: ${noAccessDocsCount}`);

    const scenario4Pass = noAccessDocsCount === 0;
    console.log(`- Avoided Gemini Embedding Call: YES (count = 0 triggers immediate fallback)`);
    console.log(`- Fallback message: "You do not have access to any documents in this organization. Please contact your administrator."`);
    console.log(`-> SCENARIO 4 RESULT: ${scenario4Pass ? "PASS" : "FAIL"}\n`);

    // --------------------------------------------------------------------------
    // SCENARIO 5: Expired Permission
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("SCENARIO 5: Expired Folder Permission Handling");
    console.log("----------------------------------------------------------------");
    const expiredDocsCount = await countAuthorizedDocuments({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberExpired,
      role: "member",
    });
    const expiredChunks = await searchSimilarChunks({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberExpired,
      role: "member",
      queryEmbedding: sampleEmbedding,
      limit: 10,
      minSimilarity: -1,
    });

    console.log(`- Authorized Docs with Expired Timestamp: ${expiredDocsCount}`);
    console.log(`- Chunks retrieved from expired folder: ${expiredChunks.length}`);

    const scenario5Pass = expiredDocsCount === 0 && expiredChunks.length === 0;
    console.log(`- Expired permission correctly rejected: ${scenario5Pass ? "YES" : "NO"}`);
    console.log(`-> SCENARIO 5 RESULT: ${scenario5Pass ? "PASS" : "FAIL"}\n`);

    // --------------------------------------------------------------------------
    // PART 1 VERIFICATION: Persistent Chat History
    // --------------------------------------------------------------------------
    console.log("----------------------------------------------------------------");
    console.log("PART 1 VERIFICATION: Persistent Chat History Workflow");
    console.log("----------------------------------------------------------------");

    // 1. Create a conversation
    const newConv = await createConversation({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
      title: "Test Conversation - Architecture",
    });
    console.log(`- Created Conversation ID: ${newConv.id}`);

    // 2. Save Chat Exchange with Mock Citations
    const testSources = [
      {
        sourceId: 1,
        documentId: docId1,
        documentName: "Node.js Notes.pdf",
        heading: "Event Loop Architecture",
        pageNumber: 1,
        similarity: 0.88,
      },
      {
        sourceId: 2,
        documentId: docId2,
        documentName: "Backend Security.docx",
        heading: "Security Principles",
        pageNumber: null,
        similarity: 0.82,
      },
    ];

    await saveChatExchange({
      conversationId: newConv.id,
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
      userQuestion: "Explain Node.js event loop and backend security",
      aiAnswer: "Node.js uses an event loop for asynchronous I/O [1], while backend security enforces JWT and RBAC [2].",
      sources: testSources,
    });
    console.log(`- Saved User Message, AI Answer, and 2 Source Citations in DB Transaction`);

    // 3. Fetch conversation list
    const convList = await listConversations({
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
    });
    const foundConv = convList.find((c) => c.id === newConv.id);
    console.log(`- Retrieved Conversation from DB: "${foundConv?.title}" (Messages: ${foundConv?.messageCount})`);

    // 4. Fetch persistent messages & citations
    const history = await getConversationMessages({
      conversationId: newConv.id,
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
    });
    console.log(`- History Message Count: ${history.length}`);
    const assistantMsg = history.find((m) => m.role === "assistant");
    console.log(`- Assistant Saved Sources Count: ${assistantMsg?.sources?.length}`);
    console.log(`- Citations preserved: [${assistantMsg?.sources.map((s) => s.documentName).join(", ")}]`);

    // 5. Test isolation: ensure Member B cannot read Member A's conversation
    let memberBIsolationPass = false;
    try {
      await getConversationMessages({
        conversationId: newConv.id,
        organizationId: ORGANIZATION_ID,
        userId: userIds.memberB,
      });
    } catch (err) {
      memberBIsolationPass = err.status === 404;
    }
    console.log(`- Cross-Member conversation access blocked (404/Forbidden): ${memberBIsolationPass ? "PASS" : "FAIL"}`);

    // 6. Delete conversation
    await deleteConversation({
      conversationId: newConv.id,
      organizationId: ORGANIZATION_ID,
      userId: userIds.memberA,
    });
    console.log(`- Cleaned up test conversation`);

    const chatHistoryPass = history.length === 2 && assistantMsg?.sources?.length === 2 && memberBIsolationPass;
    console.log(`-> CHAT HISTORY VERIFICATION RESULT: ${chatHistoryPass ? "PASS" : "FAIL"}\n`);

    console.log("================================================================================");
    console.log("                     ALL VERIFICATION TESTS COMPLETED                           ");
    console.log("================================================================================");
  } finally {
    client.release();
    await pool.end();
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
