import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import type { PlaceWithBookmark } from '@src/types';
import '@components/commons/PlaceListItem.scss';

type PlaceListItemProps = {
  place: PlaceWithBookmark;
  onBookmarkAdd: (placeId: string, bookmarkData: PlaceWithBookmark) => Promise<void>;
  onBookmarkRemove: (placeId: string) => Promise<void>;
  onSelect: (place: PlaceWithBookmark) => void;
};

const MAX_CATEGORIES = 2;

const getCategoryLabel = (categoryName: string | null): string => {
  if (!categoryName) return '';
  return categoryName
    .split('>')
    .map((category) => category.trim())
    .filter((category) => category && category !== '음식점')
    .slice(0, MAX_CATEGORIES)
    .join(' · ');
};

const PlaceListItem = ({
  place,
  onBookmarkAdd,
  onBookmarkRemove,
  onSelect,
}: PlaceListItemProps) => {
  const [isBookmarked, setIsBookmarked] = useState(place.bookmarked === 'Y');

  const handleBookmarkClick = async () => {
    if (isBookmarked) {
      await onBookmarkRemove(place.id);
      setIsBookmarked(false);
    } else {
      await onBookmarkAdd(place.id, place);
      setIsBookmarked(true);
    }
  };

  return (
    <li className="place-list-item">
      <h3 className="place-name" title={place.place_name}>
        {place.place_name}
      </h3>
      <div className="place-icons">
        <button
          type="button"
          className={`fav-btn ${isBookmarked ? 'active' : ''}`}
          onClick={handleBookmarkClick}
          aria-label={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-pressed={isBookmarked}
        >
          <StarIcon />
        </button>
        <a
          className="map-link"
          href={place.place_url}
          target="_blank"
          rel="noreferrer"
          title="카카오맵 바로가기"
          aria-label="카카오맵에서 보기"
        >
          <MapOutlinedIcon />
        </a>
      </div>
      <span className="place-category">{getCategoryLabel(place.category_name)}</span>
      <button type="button" className="select-btn" onClick={() => onSelect(place)}>
        오늘은 이거다
      </button>
    </li>
  );
};

export default PlaceListItem;
