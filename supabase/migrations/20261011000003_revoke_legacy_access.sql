-- 이전 Google Calendar 방식에서 쓰던 객체에 대한 클라이언트(anon, authenticated) 접근을 회수한다.
-- 앱은 더 이상 이 객체를 쓰지 않지만, 공개 anon key로 이메일 앞부분(user_id)과 방문·북마크 기록을 읽을 수 있었다.
-- 객체와 데이터는 그대로 둔다. DROP은 사용자 지시 후 별도로 진행한다.
-- 주의: 이전 버전 앱은 anon으로 이 객체에 접근하므로, 이 마이그레이션 이후에는 이전 앱으로 롤백할 수 없다.
-- REVOKE만 하므로 여러 번 실행해도 안전하다.

revoke all on table public.history, public.calendar, public.bookmarks
  from anon, authenticated, public;

revoke all on table public.call_places_with_history, public.call_bookmarks_with_places
  from anon, authenticated, public;

-- 함수는 인자 시그니처를 카탈로그에서 읽어 오버로드까지 모두 회수한다
do $$
declare
  fn record;
begin
  for fn in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'get_bookmarked_places',
        'get_places_with_bookmarks',
        'get_places_with_name_and_bookmarks'
      )
  loop
    execute format(
      'revoke execute on function %I.%I(%s) from anon, authenticated, public',
      fn.nspname, fn.proname, fn.args
    );
  end loop;
end;
$$;
