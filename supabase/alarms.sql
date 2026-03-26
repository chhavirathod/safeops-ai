create extension if not exists pgcrypto;

create table if not exists alarms (
  id uuid default gen_random_uuid() primary key,
  location text not null,
  is_fire boolean default false,
  is_fall boolean default false,
  created_at timestamptz default now()
);

alter table alarms
  add column if not exists created_at timestamptz default now();

create index if not exists alarms_location_idx on alarms (location);
create index if not exists alarms_created_at_idx on alarms (created_at desc);
