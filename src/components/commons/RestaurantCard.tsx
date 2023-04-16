import { Restaurant } from 'types';

type RestaurantCardProps = {
  restaurant: Restaurant;
  period?: number;
  onBtnClick?: () => void;
};

const RestaurantCard = ({
  restaurant,
  period,
  onBtnClick,
}: RestaurantCardProps) => {
  console.log(restaurant);
  console.log(restaurant.tags);
  console.log(restaurant.tags?.map((value) => value));
  return (
    <div
      style={{
        width: '100px',
        margin: 0,
      }}
    >
      {/* 식당이름 */}
      <h3>{restaurant.name}</h3>
      <div>{restaurant.visit}</div>
      <div>
        <progress value={15} max={period} />
      </div>
      {/* 식당 태그 */}
      <div>
        {
          <div>
            {restaurant.tags.map((tag, index) => (
              <p key={index}>{tag}</p>
            ))}
          </div>
        }
      </div>
      <button onClick={onBtnClick}>오늘은 이거다</button>
    </div>
  );
};

export default RestaurantCard;
