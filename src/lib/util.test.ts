import { describe, expect, it } from 'vitest';
import {
  getOAuthErrorFromUrl,
  removeLegacyStorageKeys,
  removeOAuthErrorParams,
  toLocalDateString,
  visitToEvent,
} from '@lib/util';

describe('toLocalDateString', () => {
  // UTC에서는 toISOString으로 되돌려도 아래 자정 직후 테스트가 통과하므로, KST 고정이 깨지면 여기서 먼저 알린다
  it('테스트는 Asia/Seoul 시간대에서 실행된다 (vite.config.ts test.env)', () => {
    expect(new Date(2026, 9, 6).getTimezoneOffset()).toBe(-540);
  });

  it('로컬 날짜를 YYYY-MM-DD로 만든다', () => {
    expect(toLocalDateString(new Date(2026, 9, 6))).toBe('2026-10-06');
  });

  it('한 자리 월·일을 0으로 채운다', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('로컬 자정 직후에도 그날 날짜를 쓴다 (toISOString의 UTC 밀림 방지)', () => {
    expect(toLocalDateString(new Date(2026, 9, 6, 0, 30))).toBe('2026-10-06');
  });

  it('로컬 자정 직전에도 그날 날짜를 쓴다', () => {
    expect(toLocalDateString(new Date(2026, 9, 6, 23, 59))).toBe('2026-10-06');
  });

  it('월말·연말 경계를 처리한다', () => {
    expect(toLocalDateString(new Date(2026, 1, 28))).toBe('2026-02-28');
    expect(toLocalDateString(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toLocalDateString(new Date(2027, 0, 1))).toBe('2027-01-01');
  });
});

describe('visitToEvent', () => {
  it('방문 일정을 FullCalendar 종일 이벤트로 바꾼다', () => {
    expect(
      visitToEvent({
        id: 'visit-1',
        visit_date: '2026-10-06',
        place_id: 'place-1',
        places: { place_name: '한강라멘' },
      }),
    ).toEqual({
      id: 'visit-1',
      title: '한강라멘',
      start: '2026-10-06',
      allDay: true,
    });
  });

  it('식당 정보가 없으면 대체 제목을 쓴다', () => {
    expect(
      visitToEvent({
        id: 'visit-2',
        visit_date: '2026-10-06',
        place_id: 'place-2',
        places: null,
      }).title,
    ).toBe('(알 수 없는 식당)');
  });

  it('식당 이름이 null이면 대체 제목을 쓴다', () => {
    expect(
      visitToEvent({
        id: 'visit-3',
        visit_date: '2026-10-06',
        place_id: 'place-3',
        places: { place_name: null },
      }).title,
    ).toBe('(알 수 없는 식당)');
  });
});

describe('removeLegacyStorageKeys', () => {
  it('이전 버전이 남긴 토큰·사용자 키만 지운다', () => {
    const store = new Map<string, string>([
      ['access_token', 'old-token'],
      ['token_expiry', '1700000000000'],
      ['user_id', 'someone'],
      ['hide_intro_modal_until', '1800000000000'],
      ['sb-project-auth-token', '{}'],
    ]);

    removeLegacyStorageKeys({ removeItem: (key: string) => store.delete(key) });

    expect([...store.keys()]).toEqual([
      'hide_intro_modal_until',
      'sb-project-auth-token',
    ]);
  });
});

describe('getOAuthErrorFromUrl', () => {
  it('query의 오류 설명을 읽는다', () => {
    expect(
      getOAuthErrorFromUrl(
        'http://localhost:3000/?error=access_denied&error_code=provider_error&error_description=User+denied',
      ),
    ).toBe('User denied');
  });

  it('hash의 오류 설명을 읽는다', () => {
    expect(
      getOAuthErrorFromUrl(
        'http://localhost:3000/#error=server_error&error_description=Unable%20to%20exchange',
      ),
    ).toBe('Unable to exchange');
  });

  it('설명이 없으면 오류 코드를 쓴다', () => {
    expect(getOAuthErrorFromUrl('http://localhost:3000/?error=access_denied')).toBe(
      'access_denied',
    );
  });

  it('오류가 없으면 null을 반환한다', () => {
    expect(getOAuthErrorFromUrl('http://localhost:3000/')).toBeNull();
    expect(getOAuthErrorFromUrl('http://localhost:3000/?code=abc')).toBeNull();
    expect(getOAuthErrorFromUrl('http://localhost:3000/#section')).toBeNull();
  });
});

describe('removeOAuthErrorParams', () => {
  it('query에서 오류 파라미터만 지운다', () => {
    expect(
      removeOAuthErrorParams(
        'http://localhost:3000/?keep=1&error=access_denied&error_code=x&error_description=y',
      ),
    ).toBe('http://localhost:3000/?keep=1');
  });

  it('오류 파라미터만 있던 query와 hash는 통째로 지운다', () => {
    expect(
      removeOAuthErrorParams('http://localhost:3000/?error=a&error_description=b'),
    ).toBe('http://localhost:3000/');
    expect(
      removeOAuthErrorParams('http://localhost:3000/#error=a&error_code=c&error_description=b'),
    ).toBe('http://localhost:3000/');
  });

  it('오류 파라미터가 없으면 URL을 그대로 둔다', () => {
    expect(removeOAuthErrorParams('http://localhost:3000/privacy?a=b%20c#section')).toBe(
      'http://localhost:3000/privacy?a=b%20c#section',
    );
  });
});
