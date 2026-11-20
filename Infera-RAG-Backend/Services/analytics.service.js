const pool = require("../Config/db");

async function getDashboardAnalytics(organizationId) {
  const [chartResult, activityResult] = await Promise.all([
    pool.query(
      `WITH days AS (
         SELECT (CURRENT_DATE - day_offset)::date AS activity_date
        FROM generate_series(6, 0, -1) AS days(day_offset)
       ),
       query_counts AS (
         SELECT created_at::date AS activity_date, COUNT(*)::int AS queries
         FROM messages
         WHERE organization_id = $1
           AND role = 'user'
           AND created_at >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY created_at::date
       ),
       citation_counts AS (
         SELECT m.created_at::date AS activity_date, COUNT(ms.id)::int AS citations
         FROM messages m
         LEFT JOIN message_sources ms ON ms.message_id = m.id
         WHERE m.organization_id = $1
           AND m.role = 'assistant'
           AND m.created_at >= CURRENT_DATE - INTERVAL '6 days'
         GROUP BY m.created_at::date
       )
       SELECT TO_CHAR(days.activity_date, 'Dy') AS day,
              COALESCE(query_counts.queries, 0)::int AS queries,
              COALESCE(citation_counts.citations, 0)::int AS citations
       FROM days
       LEFT JOIN query_counts USING (activity_date)
       LEFT JOIN citation_counts USING (activity_date)
       ORDER BY days.activity_date`,
      [organizationId]
    ),
    pool.query(
      `SELECT id, actor, action, target, created_at AS "createdAt"
       FROM (
         SELECT 'query:' || m.id::text AS id,
                COALESCE(u.name, 'Workspace member') AS actor,
                'asked a question in' AS action,
                c.title AS target,
                m.created_at
         FROM messages m
         JOIN conversations c
           ON c.id = m.conversation_id AND c.organization_id = m.organization_id
         LEFT JOIN users u ON u.id = c.user_id
         WHERE m.organization_id = $1 AND m.role = 'user'

         UNION ALL

         SELECT 'document:' || d.id::text,
                COALESCE(u.name, 'Workspace member'),
                'uploaded',
                d.original_filename,
                d.uploaded_at
         FROM documents d
         LEFT JOIN users u ON u.id = d.uploaded_by
         WHERE d.organization_id = $1

         UNION ALL

         SELECT 'folder:' || f.id::text,
                COALESCE(u.name, 'Workspace member'),
                'created folder',
                f.name,
                f.created_at
         FROM folders f
         LEFT JOIN users u ON u.id = f.created_by
         WHERE f.organization_id = $1

         UNION ALL

         SELECT 'feedback:' || f.id::text,
                COALESCE(u.name, 'Workspace member'),
                CASE WHEN f.helpful THEN 'rated an answer positively in'
                     ELSE 'flagged an answer for review in'
                END,
                c.title,
                f.created_at
         FROM message_feedback f
         JOIN messages m
           ON m.id = f.message_id AND m.organization_id = f.organization_id
         JOIN conversations c
           ON c.id = m.conversation_id AND c.organization_id = m.organization_id
         LEFT JOIN users u ON u.id = f.user_id
         WHERE f.organization_id = $1

         UNION ALL

         SELECT 'member:' || om.id::text,
                u.name,
                'joined the organization',
                o.name,
                om.joined_at
         FROM organization_members om
         JOIN users u ON u.id = om.user_id
         JOIN organizations o ON o.id = om.organization_id
         WHERE om.organization_id = $1 AND om.status = 'active'
       ) activity
       ORDER BY created_at DESC
       LIMIT 10`,
      [organizationId]
    ),
  ]);

  return {
    chartData: chartResult.rows,
    recentActivities: activityResult.rows,
  };
}

module.exports = { getDashboardAnalytics };
