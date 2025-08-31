BEGIN;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS token varchar(255);
CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_key ON invitations (token);
COMMIT;
