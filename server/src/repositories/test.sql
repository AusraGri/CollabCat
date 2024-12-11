SELECT 
  groups.id,
  groups.name,
  (
    SELECT json_agg(row_to_json(r))
    FROM (
      SELECT 
        rewards.amount, 
        rewards.cost, 
        rewards.created_by_user_id,  
        rewards.id, 
        rewards.target_user_ids,    
        rewards.title
      FROM rewards
      WHERE rewards.group_id = groups.id  
    ) r
  ) AS rewards,
  (
    SELECT json_agg(row_to_json(m))
    FROM (
      SELECT 
        "user".email, 
        "user".id, 
        "user".picture, 
        "user".username, 
        user_groups.role,  
        points.points
      FROM user_groups  
      INNER JOIN "user" ON "user".id = user_groups.user_id  
      LEFT JOIN points ON points.group_id = user_groups.group_id  
      WHERE user_groups.group_id = groups.id  
    ) m
  ) AS members
FROM groups
WHERE groups.id = 1;
