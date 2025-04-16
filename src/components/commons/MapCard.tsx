import '@components/commons/RestaurantCard.scss';
import { getNumTypeToday } from '@lib/util';
import { useModalDispatch } from '@src/context/ModalContext';
interface MapCardProps {
  restaurant: any; // Supabase 또는 카카오맵 데이터 모두 수용
  visitDate?: string;
}

const MapCard = ({ restaurant, visitDate }: MapCardProps) => {
  // const dispatch = useContext(UseDispatch);
  // const { state } = useModalState();
  const modalDispatch = useModalDispatch();

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
    modalDispatch({ type: 'showModal', payload: restaurant });
  };

  const renderVisitInfo = () => {
    if (!visitDate) return '최근 방문한적 없음';
    return `${Math.floor(getDiffDate(visitDate))}일 전 방문`;
  };

  const renderTags = () => {
    if (!restaurant.category_name?.length) return null;

    return (
      <div id="tags">
        <div className="tag-container">
          {restaurant.category_name
            .split('>')
            .filter((elem: string) => elem !== '음식점')
            .map((tag: string, index: number) => (
              <div key={index} className="tag">
                {tag}
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`card-container map-card`}>
      <h3>{restaurant.place_name}</h3>
      <div className="visit-info">{renderVisitInfo()}</div>
      <div className="progress-wrapper">
        <progress value={visitDate ? getDiffDate(visitDate) : 0} max={28} />
      </div>
      <div>
        <a
          id="kakao-map-link"
          href={restaurant.place_url}
          target="_blank"
          rel="noreferrer"
        >
          카카오맵 바로가기
        </a>
      </div>
      {renderTags()}
      <button
        className={'add-event-btn'}
        onClick={handleButtonClick}
        data-restaurant={JSON.stringify({
          name: restaurant.place_name,
          tags: restaurant.category_name
            .split('>')
            .filter((elem: string) => elem !== '음식점'),
          address: restaurant.address_name,
          period: 0,
        })}
      >
        오늘은 이거다
      </button>
    </div>
  );
};

export default MapCard;
