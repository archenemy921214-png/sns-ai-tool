-- profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sns_type text[] default '{}',
  bio text,
  tone text default 'casual',
  onboarded boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "profiles: own read" on profiles
  for select using (auth.uid() = id);

create policy "profiles: own write" on profiles
  for all using (auth.uid() = id);

-- posts
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  content text not null,
  sns_type text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  tags text[] default '{}',
  ai_generated boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

create policy "posts: own access" on posts
  for all using (auth.uid() = user_id);

create index posts_user_id_idx on posts(user_id);
create index posts_status_idx on posts(status);
create index posts_scheduled_at_idx on posts(scheduled_at);

-- ideas
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  tags text[] default '{}',
  used boolean default false,
  created_at timestamptz default now()
);

alter table ideas enable row level security;

create policy "ideas: own access" on ideas
  for all using (auth.uid() = user_id);

create index ideas_user_id_idx on ideas(user_id);

-- templates
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  content text not null,
  sns_type text,
  created_at timestamptz default now()
);

alter table templates enable row level security;

create policy "templates: own access" on templates
  for all using (auth.uid() = user_id);

create index templates_user_id_idx on templates(user_id);

-- subscriptions
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null default 'free',
  status text,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "subscriptions: own read" on subscriptions
  for select using (auth.uid() = user_id);

-- ai_usage
create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  period text not null,
  count integer not null default 0,
  unique(user_id, period)
);

alter table ai_usage enable row level security;

create policy "ai_usage: own read" on ai_usage
  for select using (auth.uid() = user_id);

-- AI使用量インクリメント関数（RLS回避のためsecurity definer）
create or replace function increment_ai_usage(p_user_id uuid, p_period text)
returns void
language plpgsql
security definer
as $$
begin
  insert into ai_usage(user_id, period, count)
  values (p_user_id, p_period, 1)
  on conflict (user_id, period)
  do update set count = ai_usage.count + 1;
end;
$$;

-- 新規ユーザー登録時にprofile + subscriptionを自動生成
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles(id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');

  insert into subscriptions(user_id, plan)
  values (new.id, 'free');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
