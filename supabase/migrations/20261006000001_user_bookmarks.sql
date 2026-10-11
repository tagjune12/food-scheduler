-- 이메일 앞부분 user_id를 쓰던 bookmarks를 대체한다.
-- 기존 bookmarks와 관련 뷰·함수는 사용자 지시 전까지 삭제하지 않는다.
create table public.user_bookmarks (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  place_id   text        not null references public.places (id),
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

alter table public.user_bookmarks enable row level security;

-- Supabase 기본 권한(anon/authenticated 전체 허용)을 쓰지 않고 필요한 것만 준다.
revoke all on public.user_bookmarks from anon, authenticated;
-- anon select: 비로그인 상태에서 아래 RPC가 이 테이블을 left join한다.
-- anon용 정책이 없으므로 anon이 실제로 보는 행은 0개다.
grant select on public.user_bookmarks to anon;
grant select, insert, delete on public.user_bookmarks to authenticated;

create policy user_bookmarks_select_own on public.user_bookmarks
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_bookmarks_insert_own on public.user_bookmarks
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy user_bookmarks_delete_own on public.user_bookmarks
  for delete to authenticated using (user_id = (select auth.uid()));

-- get_places_with_bookmarks(p_user_id)를 대체한다. 비로그인이면 전부 'N'.
-- 기존 함수와 같은 이름으로 오버로드하면 PostgREST의 함수 선택이 모호해질 수 있어 새 이름을 쓴다.
create function public.get_places_with_my_bookmarks()
returns table (
  id                  public.places.id%type,
  place_name          public.places.place_name%type,
  category_group_code public.places.category_group_code%type,
  category_group_name public.places.category_group_name%type,
  category_name       public.places.category_name%type,
  address_name        public.places.address_name%type,
  road_address_name   public.places.road_address_name%type,
  phone               public.places.phone%type,
  place_url           public.places.place_url%type,
  latitude            public.places.latitude%type,
  longitude           public.places.longitude%type,
  created_at          public.places.created_at%type,
  updated_at          public.places.updated_at%type,
  bookmarked          text
)
language sql stable security invoker
set search_path = ''
as $$
  select p.id, p.place_name, p.category_group_code, p.category_group_name, p.category_name,
         p.address_name, p.road_address_name, p.phone, p.place_url, p.latitude, p.longitude,
         p.created_at, p.updated_at,
         case when b.place_id is null then 'N' else 'Y' end
  from public.places p
  left join public.user_bookmarks b
    on b.place_id = p.id and b.user_id = (select auth.uid())
$$;

-- get_places_with_name_and_bookmarks(p_place_names, p_user_id)를 대체한다.
create function public.get_places_by_names_with_my_bookmarks(p_place_names text[])
returns table (
  id                  public.places.id%type,
  place_name          public.places.place_name%type,
  category_group_code public.places.category_group_code%type,
  category_group_name public.places.category_group_name%type,
  category_name       public.places.category_name%type,
  address_name        public.places.address_name%type,
  road_address_name   public.places.road_address_name%type,
  phone               public.places.phone%type,
  place_url           public.places.place_url%type,
  latitude            public.places.latitude%type,
  longitude           public.places.longitude%type,
  created_at          public.places.created_at%type,
  updated_at          public.places.updated_at%type,
  bookmarked          text
)
language sql stable security invoker
set search_path = ''
as $$
  select p.id, p.place_name, p.category_group_code, p.category_group_name, p.category_name,
         p.address_name, p.road_address_name, p.phone, p.place_url, p.latitude, p.longitude,
         p.created_at, p.updated_at,
         case when b.place_id is null then 'N' else 'Y' end
  from public.places p
  left join public.user_bookmarks b
    on b.place_id = p.id and b.user_id = (select auth.uid())
  where p.place_name = any (p_place_names)
$$;
