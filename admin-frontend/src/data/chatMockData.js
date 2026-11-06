// Realistic Full Stack Developer Interview Mock Data for Infera AI Chat Playground
export const fullStackInterviewQuestions = [
  {
    id: 'prompt-1',
    label: 'Virtual DOM vs Real DOM',
    query: 'How does React Virtual DOM reconciliation work and why is it faster than direct DOM manipulation?'
  },
  {
    id: 'prompt-2',
    label: 'Node.js Event Loop',
    query: 'Explain the Node.js Event Loop phases and how non-blocking I/O is handled behind the scenes.'
  },
  {
    id: 'prompt-3',
    label: 'SQL vs NoSQL Databases',
    query: 'When should a full-stack engineer choose PostgreSQL (Relational) over MongoDB (Document store)?'
  },
  {
    id: 'prompt-4',
    label: 'JWT Auth & Security',
    query: 'How do JSON Web Tokens (JWT) authenticate API requests, and what are best practices to prevent XSS/CSRF?'
  }
];

// Pre-seeded interview Q&A conversation history for testing
export const initialInterviewConversation = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'What is the difference between SQL and NoSQL databases, and when should we choose one over the other for a scalable web application?',
    timestamp: '11:02 AM'
  },
  {
    id: 'msg-2',
    sender: 'ai',
    text: `Based on your technical knowledge base in the **Engineering** repository, here is the architectural comparison:

1. **Data Structure & Schema:**
   - **SQL (Relational):** Enforces a rigid tabular schema with predefined columns, foreign keys, and strict ACID compliance (Atomicity, Consistency, Isolation, Durability). Ideal for transactional systems like payments and core banking.
   - **NoSQL (Non-Relational):** Uses flexible schema formats such as JSON documents, key-value pairs, wide-column stores, or graphs. Follows BASE properties (Basically Available, Soft state, Eventual consistency).

2. **Scaling Strategy:**
   - SQL scales primarily **vertically** (increasing CPU, RAM, or SSD storage on a single instance), though read-replicas and sharding exist.
   - NoSQL scales **horizontally** (partitioning and distributed clusters across multiple cheap nodes).

3. **Recommendation for Production:**
   - Choose **PostgreSQL** when strong relational integrity, complex multi-table joins, and zero financial data inconsistency are critical.
   - Choose **MongoDB / DynamoDB** when dealing with rapidly evolving unstructured schemas, high-velocity clickstream logs, or distributed IoT telemetry.`,
    citations: [
      {
        docName: 'FullStack_Architecture_Handbook_2026.pdf',
        folder: 'IT',
        page: 42,
        similarity: 0.96,
        excerpt: 'Relational databases guarantee strict serializability and ACID guarantees for enterprise transactional workloads, whereas document-oriented NoSQL databases prioritize horizontal write throughput and dynamic schema flexibility.'
      },
      {
        docName: 'Database_System_Design_SOP.pdf',
        folder: 'General',
        page: 18,
        similarity: 0.89,
        excerpt: 'For high-concurrency microservices, prefer polyglot persistence: PostgreSQL for user accounts and billing, coupled with Redis for distributed session caching and MongoDB for unstructured audit events.'
      }
    ],
    timestamp: '11:02 AM',
    userRating: 'Helpful'
  },
  {
    id: 'msg-3',
    sender: 'user',
    text: 'Explain how the Node.js Event Loop operates and what happens during the MacroTask vs MicroTask queues.',
    timestamp: '11:05 AM'
  },
  {
    id: 'msg-4',
    sender: 'ai',
    text: `According to the **Node.js Runtime & Concurrency Manual**, here is how the single-threaded asynchronous runtime executes:

- **Single Thread & libuv:**
  Node.js executes JavaScript on a single thread (V8 engine) while delegating long-running operating system I/O, file reading, and cryptographic operations to the **libuv thread pool**.

- **Event Loop Phases (Order of Execution):**
  1. **Timers Phase:** Executes callbacks scheduled by \`setTimeout()\` and \`setInterval()\`.
  2. **Pending Callbacks (I/O):** Executes system-level errors and deferred OS callbacks.
  3. **Idle, Prepare:** Internal libuv lifecycle management.
  4. **Poll Phase:** Retrieves new I/O events, reads network sockets, and waits if no timers are pending.
  5. **Check Phase:** Executes immediate callbacks scheduled via \`setImmediate()\`.
  6. **Close Callbacks:** Executes socket/file closure handlers like \`socket.on('close')\`.

- **MicroTasks Priority (Highest Priority):**
  Microtasks (\`process.nextTick()\` and resolved \`Promise.then()\` / \`await\`) run **immediately after the current operation finishes**, before the Event Loop transitions to the next phase.`,
    citations: [
      {
        docName: 'NodeJS_Concurrency_Libuv_Guide.pdf',
        folder: 'IT',
        page: 27,
        similarity: 0.97,
        excerpt: 'Microtasks scheduled via process.nextTick() and Promise microtask queues possess absolute priority over macrotask timers and execute immediately upon completion of the synchronous call stack.'
      }
    ],
    timestamp: '11:05 AM',
    userRating: null
  }
];

// Contextual fallback response generator for any other full-stack technical query
export const generateFullStackResponse = (query, folder) => {
  const lower = query.toLowerCase();

  if (lower.includes('dom') || lower.includes('react')) {
    return {
      text: `Based on your **Frontend Engineering Documentation** in the **${folder}** repository:

- **Virtual DOM Concept:** React maintains a lightweight, in-memory tree representation of the actual browser DOM.
- **Diffing Algorithm (Reconciliation):** When component state changes, React creates a new Virtual DOM tree, runs an O(n) heuristic diffing algorithm against the previous tree, and batches only the minimal set of real DOM mutations.
- **Performance Benefit:** Real browser DOM manipulation causes layout reflows and repaints, which are expensive. Batching updates via the Virtual DOM minimizes layout recalculations.`,
      citations: [
        {
          docName: 'Modern_React_19_Internal_Architecture.pdf',
          folder: folder === 'All Folders' ? 'IT' : folder,
          page: 15,
          similarity: 0.95,
          excerpt: 'React fiber reconciliation schedules updates asynchronously across priority lanes, generating minimal DOM change operations rather than re-rendering full subtrees.'
        }
      ]
    };
  }

  if (lower.includes('jwt') || lower.includes('auth') || lower.includes('security')) {
    return {
      text: `Based on the **Security & Authentication Standard SOP**:

1. **JWT Architecture:** A stateless token containing a Base64URL-encoded \`Header.Payload.Signature\`, signed using asymmetric keys (RS256) or symmetric HMAC (HS256).
2. **Storage Best Practice:** Store the Access Token in memory and the Refresh Token inside a secure **\`HttpOnly, Secure, SameSite=Strict\` cookie** to shield it from Cross-Site Scripting (XSS).
3. **CSRF Mitigation:** Use SameSite cookie flags and Anti-CSRF verification tokens on state-changing API endpoints.`,
      citations: [
        {
          docName: 'OAuth2_JWT_Security_Guidelines.pdf',
          folder: folder === 'All Folders' ? 'IT' : folder,
          page: 9,
          similarity: 0.98,
          excerpt: 'Never store persistent authentication tokens inside browser localStorage or sessionStorage due to direct vulnerability to XSS script injection.'
        }
      ]
    };
  }

  // Generic technical fallback
  return {
    text: `Based on verified organization engineering standards in the **${folder}** repository for: *"${query}"*:

- **Technical Evaluation:** In a full-stack production environment, this pattern requires clean separation of concerns, defensive input validation, automated unit/integration tests (Jest/Vitest), and end-to-end containerized deployments with CI/CD health checks.
- **Implementation Note:** Ensure all API endpoints implement standard HTTP status codes, centralized error logging (Winston/Pino), and structured response schemas.`,
    citations: [
      {
        docName: 'FullStack_Architecture_Handbook_2026.pdf',
        folder: folder === 'All Folders' ? 'General' : folder,
        page: 54,
        similarity: 0.91,
        excerpt: 'Standardize service layers across microservices to isolate business domain logic from transport protocols and persistence drivers.'
      }
    ]
  };
};