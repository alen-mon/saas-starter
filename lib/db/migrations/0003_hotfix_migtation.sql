-- 1) Add the new columns if they aren't there yet
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS owner_id    integer,
  ADD COLUMN IF NOT EXISTS owner_type  varchar(30);

-- 2) Backfill owner_id from old user_id (only where owner_id is null)
UPDATE documents
SET owner_id = user_id
WHERE owner_id IS NULL
  AND user_id IS NOT NULL;

-- 3) Ensure owner_type is present (default everything old to 'user')
UPDATE documents
SET owner_type = 'user'
WHERE owner_type IS NULL;

-- 4) (Optional but recommended) drop the old column once you're confident
ALTER TABLE documents
  DROP COLUMN IF EXISTS user_id;

-- 5) Add an index for your query pattern in /api/team/status
CREATE INDEX IF NOT EXISTS documents_owner_type_id_idx
  ON documents (owner_type, owner_id);

