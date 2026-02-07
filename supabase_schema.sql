-- 1. Table for Global Settings (Curriculum, Configs)
create table settings (
  id text primary key,
  value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Turn on Row Level Security
alter table settings enable row level security;

-- 3. Policies (Simplest for Development - Open Access)
-- WARNING: In production, you should lock writes to authenticated admins only.
create policy "Enable Read Access for All" on settings for select using (true);
create policy "Enable Insert for All" on settings for insert with check (true);
create policy "Enable Update for All" on settings for update using (true);

-- 4. Table for Lessons/Content (Future Proofing)
create table lessons (
    id text primary key,
    title text,
    content jsonb,
    is_locked boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table lessons enable row level security;
create policy "Enable Read Access for All" on lessons for select using (true);
create policy "Enable Insert for All" on lessons for insert with check (true);
create policy "Enable Update for All" on lessons for update using (true);
