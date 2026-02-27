import React from 'react';
import '@components/calendar/CalendarListModal.scss';

export interface CalendarListModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarList?: {
    items: Array<{
      id: string;
      backgroundColor: string;
      foregroundColor: string;
      summary: string;
    }>;
  };
  onSelectCalendar: (id: string, summary: string) => void;
}

const CalendarListModal = ({
  isOpen,
  onClose,
  calendarList,
  onSelectCalendar,
}: CalendarListModalProps) => {
  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-header">Google Calendar</h2>
        <div className="calendar-list">
          {calendarList?.items
            ?.filter(
              (item) =>
                item.summary !== '대한민국의 휴일',
            )
            .map((item) => (
              <div
                key={item.id}
                className="calendar-item"
                onClick={() => {
                  onSelectCalendar(item.id, item.summary);
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