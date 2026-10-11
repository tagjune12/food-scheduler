-- Google Calendar 이벤트를 대체하는 방문 일정. 하루 개수 제한이 없으므로 유니크 제약을 두지 않는다.
create table public.visits (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  place_id   text        not null references public.places (id),
  visit_date date        not null,
  created_at timestamptz not null default now()
);

create index visits_user_date_idx on public.visits (user_id, visit_date);

alter table public.visits enable row level security;

revoke all on public.visits from anon, authenticated;
grant select, insert, delete on public.visits to authenticated;
-- 수정은 날짜 이동만 허용한다
grant update (visit_date) on public.visits to authenticated;

create policy visits_select_own on public.visits
  for select to authenticated using (user_id = (select auth.uid()));
create policy visits_insert_own on public.visits
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy visits_update_own on public.visits
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy visits_delete_own on public.visits
  for delete to authenticated using (user_id = (select auth.uid()));
