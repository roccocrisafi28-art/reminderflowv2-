-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) not null unique,
  name text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive', -- inactive | trialing | active | past_due | canceled
  created_at timestamp with time zone default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) not null,
  name text not null,
  email text not null,
  service text not null,
  appointment_date text not null,
  appointment_time text not null,
  status text not null default 'upcoming', -- upcoming | reminded | rescheduled
  created_at timestamp with time zone default now()
);

alter table businesses enable row level security;
alter table clients enable row level security;

-- A business owner can only see and edit their own business row
create policy "Owners manage their own business"
  on businesses for all
  using (auth.uid() = owner_id);

-- A business owner can only see and edit clients belonging to their business
create policy "Owners manage their own clients"
  on clients for all
  using (
    business_id in (select id from businesses where owner_id = auth.uid())
  );
