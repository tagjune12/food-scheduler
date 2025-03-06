import '@components/commons/RestaurantCard.scss';
import { Restaurant } from '@src/types';
import { useContext } from 'react';
import { UseDispatch } from '@src/App';
import { getNumTypeToday } from '@lib/util';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visitDate?: string;
  onMap?: boolean;
};

const RestaurantCard = ({
  restaurant,
  visitDate,
  onMap,
}: RestaurantCardProps) => {
  const dispatch = useContext(UseDispatch);

  const getDiffDate = (visitDate: string): number => {
    const today = getNumTypeToday();
    const visit = (() => {
      const temp = visitDate.split('-');

      return {
        year: parseInt(temp[0]),
        month: parseInt(temp[1]),
        date: parseInt(temp[2]),
      };
    })();

    const diffMs =
      new Date(today.year, today.month, today.date).getTime() -
      new Date(visit.year, visit.month, visit.date).getTime();

    // console.log(
    //   restaurant.name,
    //   ':',
    //   today,
    //   visit,
    //   diffMs / (1000 * 60 * 60 * 24),
    // );

    return diffMs / (1000 * 60 * 60 * 24);
  };

  const onBtnClick = () => {
    dispatch({ type: 'showModal', payload: restaurant });
  };

  return (
    <div
      className="card-container"
      style={{
        maxWidth: onMap ? '190px' : 'none',
      }}
    >
      <h3>{restaurant.name}</h3>
      <div className="visit-info">
        {visitDate
          ? `${Math.floor(getDiffDate(visitDate))}일 전 방문`
          : '최근 방문한적 없음'}
      </div>
      <div className="progress-wrapper">
        <progress value={visitDate ? getDiffDate(visitDate) : 0} max={28} />
      </div>
      {restaurant.tags && restaurant.tags.length > 0 && (
        <div id="tags">
          <div className="tag-container">
            {restaurant.tags.map((tag, index) => (
              <div key={index} className="tag">
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}
      <button className={onMap ? 'add-event-btn' : ''} onClick={onBtnClick}>
        오늘은 이거다
      </button>
    </div>
  );
};

export default RestaurantCard;
