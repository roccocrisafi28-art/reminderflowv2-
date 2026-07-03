-- Run this in the Supabase SQL Editor ONLY IF you already ran supabase-schema.sql
-- before this update. It adds the new billing columns without touching your
-- existing data. If you're setting up fresh, just use supabase-schema.sql —
-- you don't need this file.

alter table businesses add column if not exists stripe_customer_id text;
alter table businesses add column if not exists stripe_subscription_id text;
alter table businesses add column if not exists subscription_status text not null default 'inactive';
