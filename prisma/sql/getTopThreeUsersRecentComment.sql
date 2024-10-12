WITH Top3Users AS (
  SELECT u.id, u.name, COUNT(p.id) AS "postCount"
  FROM users u
  LEFT JOIN posts p ON u.id = p."userId"
  GROUP BY u.id, u.name
  ORDER BY "postCount" DESC
  LIMIT 3
)
SELECT t.id, t.name, p.title AS "postTitle", c.content AS comment
FROM Top3Users t
LEFT JOIN LATERAL (
  SELECT DISTINCT ON (c."userId") c.content, c."createdAt", c."postId"
  FROM comments c
  WHERE c."userId" = t.id
  ORDER BY c."userId", c."createdAt" DESC
) c ON true
LEFT JOIN posts p ON c."postId" = p.id;
