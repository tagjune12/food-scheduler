import { Restaurant } from 'types';

type RestaurantCardProps = {
  restaurant: Restaurant;
  period?: number;
};

const RestaurantCard = ({ restaurant, period }: RestaurantCardProps) => {
  return (
    <div
      style={{
        width: '100px',
        margin: 0,
      }}
    >
      <img src="#" alt="사진" />
      <h3>타이틀</h3>
      {period && (
        <>
          <div>
            <progress value={15} max={period} />
          </div>
          <div>
            {restaurant.tags.map((tag, index) => (
              <p key={index}>{tag}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantCard;
