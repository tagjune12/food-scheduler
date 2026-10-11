import { describe, expect, it } from 'vitest';
import { toLocalDateString, visitToEvent } from '@lib/util';

describe('toLocalDateString', () => {
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
