import React from 'react';
import '@components/calendar/CalendarListModal.scss';
import { setUserCalendar } from '@lib/api/supabase_api';

// TODO: 구글캘린더 목록 가져와서 사용할 캘린더 불러오는 모달 작성중
interface CalendarListModalProps {
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

const CalendarListModal = ({
  isOpen,
  onClose,
  onSelect,
  calendarList,
}: CalendarListModalProps) => {
  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  const clickListItem = (id: string) => {
    if (window.confirm(`${id}를 선택하시겠습니까?`)) {
      const userId = localStorage.getItem('user_id');
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
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation: 클릭 이벤트가 부모(overlay)로 퍼지는 것을 방지 */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-header">Google Calendar</h2>
        <div className="calendar-list">
          {calendarList?.items?.map((item) => (
            <div
              key={item.id}
              className="calendar-item"
              onClick={() => {
                clickListItem(item.id);
              }}
            >
              <div
                className="icon-box"
                style={{
                  backgroundColor: item.backgroundColor,
                  color: item.foregroundColor,
                }}
              >
                📅
              </div>
              <span className="calendar-name">{item.summary}</span>
            </div>
          )) || (
            <p style={{ textAlign: 'center', color: '#666' }}>
              캘린더 목록이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarListModal;
