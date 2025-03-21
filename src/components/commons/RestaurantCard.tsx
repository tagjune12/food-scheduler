import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
import { useContext } from 'react';
import { UseDispatch } from '@src/App';
import { getNumTypeToday } from '@lib/util';

interface RestaurantCardProps {
  restaurant: Restaurant;
  visitDate?: string;
  onMap?: boolean;
}

const RestaurantCard = ({
  restaurant,
  visitDate,
  onMap,
}: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);

  const getDiffDate = (visitDate: string): number => {
    const today = getNumTypeToday();
    const visit = {
      year: parseInt(visitDate.split('-')[0]),
      month: parseInt(visitDate.split('-')[1]),
      date: parseInt(visitDate.split('-')[2]),
    };

    const diffMs =
      new Date(today.year, today.month, today.date).getTime() -
      new Date(visit.year, visit.month, visit.date).getTime();

    return diffMs / (1000 * 60 * 60 * 24);
  };

  const handleButtonClick = () => {
    dispatch({ type: 'showModal', payload: restaurant });
  };

  const renderVisitInfo = () => {
    if (!visitDate) return '최근 방문한적 없음';
    return `${Math.floor(getDiffDate(visitDate))}일 전 방문`;
  };

  const renderTags = () => {
    if (!restaurant.tags?.length) return null;

    return (
      <div id="tags">
        <div className="tag-container">
          {restaurant.tags.map((tag, index) => (
            <div key={index} className="tag">
              {tag}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`card-container ${onMap ? 'map-card' : ''}`}>
      <h3>{restaurant.name}</h3>
      <div className="visit-info">{renderVisitInfo()}</div>
      <div className="progress-wrapper">
        <progress value={visitDate ? getDiffDate(visitDate) : 0} max={28} />
      </div>
      {renderTags()}
      <button
        className={onMap ? 'add-event-btn' : ''}
        onClick={handleButtonClick}
      >
        오늘은 이거다
      </button>
    </div>
  );
};

export default RestaurantCard;
