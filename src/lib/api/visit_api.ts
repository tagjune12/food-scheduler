import { supabase } from '@lib/api/supabase_api';
import type { VisitWithPlace } from '@src/types';

const VISIT_SELECT = 'id, visit_date, place_id, places(place_name)';

// 기존 supabase_api와 달리 실패 시 null을 반환해 '일정 없음'([])과 구분한다
export const getVisits = async (
  startDate: string,
  endDate: string,
): Promise<VisitWithPlace[] | null> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select(VISIT_SELECT)
      .gte('visit_date', startDate)
      .lt('visit_date', endDate)
      .order('visit_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getVisits:', error);
    return null;
  }
};

export const addVisit = async (
  placeId: string,
  visitDate: string,
): Promise<VisitWithPlace | null> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .insert({ place_id: placeId, visit_date: visitDate })
      .select(VISIT_SELECT)
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in addVisit:', error);
    return null;
  }
};

// RLS로 보이지 않는 행은 오류 없이 0건 처리되므로, 반환 행 수로 성공 여부를 판단한다
export const moveVisit = async (
  visitId: string,
  visitDate: string,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .update({ visit_date: visitDate })
      .eq('id', visitId)
      .select('id');

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new Error('수정할 방문 일정을 찾을 수 없습니다.');
    }
    return true;
  } catch (error) {
    console.error('Error in moveVisit:', error);
    return false;
  }
};

export const deleteVisit = async (visitId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('visits')
      .delete()
      .eq('id', visitId)
      .select('id');

    if (error) {
      throw error;
    }
    if (data.length === 0) {
      throw new Error('삭제할 방문 일정을 찾을 수 없습니다.');
    }
    return true;
  } catch (error) {
    console.error('Error in deleteVisit:', error);
    return false;
  }
};
