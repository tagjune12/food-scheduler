import React from 'react';
import CalendarListModal from './CalendarListModal';
import { setUserCalendar } from '@lib/api/supabase_api';
import { getStoredUserId } from '@lib/util';

interface CalendarListModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (calendarId: string) => void;
  calendarList?: {
    items: Array<{
      id: string;
      backgroundColor: string;
      foregroundColor: string;
      summary: string;
    }>;
  };
}

export default function CalendarListModalContainer({
  isOpen,
  onClose,
  onSelect,
  calendarList,
}: CalendarListModalContainerProps) {
  const handleCalendarSelect = (id: string, summary: string) => {
    if (window.confirm(`${summary}를 선택하시겠습니까?`)) {
      const userId = getStoredUserId();
      try {
        if (userId) {
          setUserCalendar(userId, id).then(() => {
            onSelect(id);
            onClose();
          });
        }
      } catch (e) {
        alert('캘린더 선택에 실패했습니다.');
      }
    }
  };

  return (
    <CalendarListModal
      isOpen={isOpen}
      onClose={onClose}
      calendarList={calendarList}
      onSelectCalendar={handleCalendarSelect}
    />
  );
}
