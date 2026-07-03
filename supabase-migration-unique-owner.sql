-- Run this in the Supabase SQL Editor if you already have a businesses table.
-- It stops the exact bug where one account ends up with two business rows,
-- which breaks login/dashboard lookups.
--
-- IMPORTANT: if you currently have duplicate rows for the same owner_id,
-- delete the extras in Table Editor BEFORE running this — otherwise this
-- command will fail with a "duplicate key" error.

alter table businesses add constraint businesses_owner_id_key unique (owner_id);
