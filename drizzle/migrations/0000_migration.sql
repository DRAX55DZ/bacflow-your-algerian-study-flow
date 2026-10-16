
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  stream text not null default 'sci' check (stream in ('sci','math')),
  theme text not null default 'dark',
  onboarded boolean not null default false,
  invite_code text not null unique default ('BAC-' || upper(substr(md5(random()::text), 1, 4))),
  last_activity text not null default '',
  created_at timestamptz not null default now()
);
create table public.progress (user_id uuid not null, item_id text not null, done_at timestamptz not null default now(), primary key (user_id, item_id));
create table public.activity (user_id uuid not null, day date not null, count int not null default 0, primary key (user_id, day));
create table public.notes (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), type text not null, text text not null, created_at timestamptz not null default now());
create table public.targets (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), text text not null, done boolean not null default false, created_at timestamptz not null default now());
create table public.friendships (user_id uuid not null, friend_id uuid not null, created_at timestamptz not null default now(), primary key (user_id, friend_id));
create table public.nudges (id uuid primary key default gen_random_uuid(), from_id uuid not null default auth.uid(), to_id uuid not null, kind text not null default 'nudge', created_at timestamptz not null default now(), seen boolean not null default false);
create table public.messages (id uuid primary key default gen_random_uuid(), room text not null, sender_id uuid not null default auth.uid(), sender_name text not null default '', text text not null default '', attach_kind text, attach_label text, attach_path text, created_at timestamptz not null default now());

grant select, insert, update, delete on public.profiles, public.progress, public.activity, public.notes, public.targets, public.friendships, public.nudges, public.messages to authenticated;
grant all on public.profiles, public.progress, public.activity, public.notes, public.targets, public.friendships, public.nudges, public.messages to service_role;

alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.activity enable row level security;
alter table public.notes enable row level security;
alter table public.targets enable row level security;
alter table public.friendships enable row level security;
alter table public.nudges enable row level security;
alter table public.messages enable row level security;

create or replace function public.is_friend(_other uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.friendships where user_id = auth.uid() and friend_id = _other)
$$;

create policy "own or friend profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_friend(id));
create policy "insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "update own profile" on public.profiles for update to authenticated using (id = auth.uid());

create policy "read progress" on public.progress for select to authenticated using (user_id = auth.uid() or public.is_friend(user_id));
create policy "write progress" on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy "delete progress" on public.progress for delete to authenticated using (user_id = auth.uid());

create policy "read activity" on public.activity for select to authenticated using (user_id = auth.uid() or public.is_friend(user_id));
create policy "insert activity" on public.activity for insert to authenticated with check (user_id = auth.uid());
create policy "update activity" on public.activity for update to authenticated using (user_id = auth.uid());

create policy "own notes" on public.notes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own targets" on public.targets for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read friendships" on public.friendships for select to authenticated using (user_id = auth.uid() or friend_id = auth.uid());
create policy "delete friendships" on public.friendships for delete to authenticated using (user_id = auth.uid() or friend_id = auth.uid());

create policy "read nudges" on public.nudges for select to authenticated using (to_id = auth.uid() or from_id = auth.uid());
create policy "send nudge to friend" on public.nudges for insert to authenticated with check (from_id = auth.uid() and public.is_friend(to_id));
create policy "mark nudge seen" on public.nudges for update to authenticated using (to_id = auth.uid());

create policy "read messages" on public.messages for select to authenticated using (
  sender_id = auth.uid()
  or (room = 'group' and public.is_friend(sender_id))
  or (room like 'dm-%' and position(auth.uid()::text in room) > 0)
);
create policy "send messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and (room = 'group' or (room like 'dm-%' and position(auth.uid()::text in room) > 0))
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''));
  insert into public.targets (user_id, text) values (new.id, 'Complete 2 Physics exercises'), (new.id, 'Read 1 Math unit summary'), (new.id, 'Solve 1 past Bac topic');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.add_friend(_code text) returns json language plpgsql security definer set search_path = public as $$
declare f public.profiles;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  select * into f from public.profiles where invite_code = upper(trim(_code));
  if f.id is null then raise exception 'No student found with that code'; end if;
  if f.id = auth.uid() then raise exception 'That is your own code'; end if;
  insert into public.friendships (user_id, friend_id) values (auth.uid(), f.id), (f.id, auth.uid()) on conflict do nothing;
  return json_build_object('id', f.id, 'name', f.name);
end $$;
revoke execute on function public.add_friend(text) from public, anon;
grant execute on function public.add_friend(text) to authenticated;
grant execute on function public.is_friend(uuid) to authenticated;

alter table public.messages replica identity full;
alter publication supabase_realtime add table public.messages, public.nudges, public.friendships, public.progress, public.profiles;

create policy "upload own chat files" on storage.objects for insert to authenticated with check (bucket_id = 'chat-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read chat files" on storage.objects for select to authenticated using (bucket_id = 'chat-files');
