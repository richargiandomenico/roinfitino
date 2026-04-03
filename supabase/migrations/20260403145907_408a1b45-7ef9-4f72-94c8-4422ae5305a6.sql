-- Remove duplicate roles, keep only one per user
DELETE FROM public.user_roles a USING public.user_roles b
WHERE a.id > b.id AND a.user_id = b.user_id;

-- Add unique constraint on user_id alone to prevent future duplicates
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

-- Drop the old (user_id, role) unique constraint since we now have user_id unique
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;