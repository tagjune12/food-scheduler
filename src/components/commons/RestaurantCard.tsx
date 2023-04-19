import { Restaurant } from 'types';

type RestaurantCardProps = {
  restaurant: Restaurant;
  visit?: string;
  period?: number;
  setTodayRestaurant?: (arg: Restaurant) => void;
};

const RestaurantCard = ({
  restaurant,
  visit,
  period,
  setTodayRestaurant,
}: RestaurantCardProps) => {
  const onBtnClick = () => {
    setTodayRestaurant!(restaurant);
  };

  return (
    <div
      style={{
        width: '100px',
        margin: 0,
      }}
    >
      {/* 식당이름 */}
      <h3>{restaurant.name}</h3>
      <div>{visit ?? '없음'}</div>
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
      {setTodayRestaurant ? (
        <button onClick={onBtnClick}>오늘은 이거다</button>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RestaurantCard;
