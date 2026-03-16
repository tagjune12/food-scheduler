import '@components/commons/RestaurantCard.scss';
import { convertPlaceToRestaurant, getNumTypeToday } from '@lib/util';
import { useModalDispatch } from '@src/context/ModalContext';

import StarIcon from '@mui/icons-material/Star';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

interface RestaurantCardProps {
  restaurant: any; // Supabase 또는 카카오맵 데이터 모두 수용
  visitDate?: string;
  onMap?: boolean;
  callback?: (restaurantId: string) => void;
}

const RestaurantCard = ({
  restaurant,
  visitDate,
  onMap,
  callback,
}: RestaurantCardProps) => {
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
    const item = convertPlaceToRestaurant(restaurant);
    modalDispatch({ type: 'showModal', payload: item });
  };

  const handleBookmarkClick = () => {
    if (window.confirm('북마크를 취소하시겠습니까?')) {
      callback?.(restaurant.id);
    }
  };

  return (
    <section className={`map-card-horizontal ${onMap ? 'map-card' : ''}`}>
      <div className="content-row">
        <div className="info-container">
          <div className="title-row">
            <h2>{restaurant.place_name || restaurant.name}</h2>
            <a
              className="map-link"
              href={restaurant.place_url}
              target="_blank"
              rel="noreferrer"
              title="카카오맵 바로가기"
            >
              <MapOutlinedIcon />
            </a>
            <button className="fav-btn" onClick={handleBookmarkClick}>
              <StarIcon className={restaurant.bookmarked === 'N' ? 'inactive' : 'active'} />
            </button>
          </div>

          {restaurant.category_name && (
            <div className="tags-row">
              {(() => {
                const allTags = restaurant.category_name
                  .split('>')
                  .filter((elem: string) => elem !== '음식점')
                  .map((t: string) => t.trim())
                  .filter(Boolean);

                const maxTags = 3;
                const visibleTags = allTags.slice(0, maxTags);
                const hasMore = allTags.length > maxTags;

                return (
                  <>
                    {visibleTags.map((tag: string, index: number) => (
                      <span key={index} className="tag-item">
                        {tag}
                      </span>
                    ))}
                    {hasMore && <span className="tag-item tag-more">...</span>}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {visitDate && (
        <div className="progress-wrapper">
          <progress value={getDiffDate(visitDate)} max={28} />
        </div>
      )}

      <div className="actions-row">
        <button
          className={onMap ? 'add-btn add-event-btn' : 'add-btn'}
          onClick={handleButtonClick}
          data-restaurant={JSON.stringify({
            name: restaurant.place_name || restaurant.name,
            tags: restaurant.category_name
              ? restaurant.category_name
                  .split('>')
                  .filter((elem: string) => elem !== '음식점')
              : [],
            address: restaurant.address_name,
            period: 0,
          })}
        >
          오늘은 이거다
        </button>
      </div>
    </section>
  );
};

export default RestaurantCard;
